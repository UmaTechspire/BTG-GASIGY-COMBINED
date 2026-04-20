import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection_sync(db_name):
    return mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=db_name,
        port=int(os.getenv('DB_PORT', 3306))
    )

try:
    finance_db = os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live')
    conn = get_db_connection_sync(finance_db)
    cursor = conn.cursor(dictionary=True)

    print(f"Connected to: {finance_db}")

    # Find Cash Advance claims that are Approved, PPP >= 41, Mode = 1
    # Check if they are being blocked by the NOT EXISTS clause
    query = """
    SELECT 
        h.ApplicationNo, 
        h.Claim_ID,
        h.ModeOfPaymentId,
        h.SummaryId,
        s.PaymentNo,
        h.PPP_PV_Director_approve,
        (SELECT COUNT(*) FROM tbl_ar_receipt r WHERE r.ar_id = h.Claim_ID AND r.is_active = 1) as link_count,
        (SELECT COUNT(*) FROM tbl_ar_receipt r WHERE LOWER(r.reference_no) LIKE CONCAT('%', LOWER(TRIM(h.ApplicationNo)), '%') AND r.is_active = 1) as text_match_count,
        (SELECT reference_no FROM tbl_ar_receipt r WHERE LOWER(r.reference_no) LIKE CONCAT('%', LOWER(TRIM(h.ApplicationNo)), '%') AND r.is_active = 1 LIMIT 1) as matching_ref
    FROM tbl_claimAndpayment_header h
    INNER JOIN tbl_PaymentSummary_header s ON h.SummaryId = s.SummaryId
    LEFT JOIN master_claimcategory mc ON h.ClaimCategoryId = mc.Id
    WHERE h.PPP_PV_Director_approve = 1
      AND h.ModeOfPaymentId = 1
      AND h.IsActive = 1
      AND h.SummaryId > 0
      AND s.PaymentNo >= 'PPP0000041'
      AND mc.claimcategory = 'Cash Advance'
    """
    cursor.execute(query)
    claims = cursor.fetchall()
    
    print("\n--- Diagnostic: Approved CA Claims meeting all criteria ---")
    print(f"{'AppNo':<20} | {'PPP':<15} | {'Linked':<6} | {'TextMatched':<11} | {'First Match'}")
    
    blocked_count = 0
    for c in claims:
        is_blocked = (c['link_count'] > 0 or c['text_match_count'] > 0)
        status = "BLOCKED" if is_blocked else "OK"
        print(f"{c['ApplicationNo']:<20} | {c['PaymentNo']:<15} | {c['link_count']:<6} | {c['text_match_count']:<11} | {c['matching_ref'] or ''}")
        if is_blocked: blocked_count += 1

    print(f"\nTotal Meeting Criteria: {len(claims)}")
    print(f"Total Blocked (Excluded): {blocked_count}")

    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
