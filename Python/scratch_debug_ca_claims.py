import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection_sync():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live'),
        port=int(os.getenv('DB_PORT', 3306))
    )

try:
    conn = get_db_connection_sync()
    cursor = conn.cursor(dictionary=True)

    # 1. Check Mode of Payment labels
    cursor.execute("SELECT ModeOfPaymentId, ModeOfPayment FROM master_modeofpayment")
    modes = cursor.fetchall()
    print("--- Mode of Payment Masters ---")
    for m in modes:
        print(f"  {m['ModeOfPaymentId']}: {m['ModeOfPayment']}")

    # 2. Check Claim Categories
    cursor.execute("SELECT Id, claimcategory FROM master_claimcategory")
    cats = cursor.fetchall()
    print("\n--- Claim Categories ---")
    for c in cats:
        print(f"  {c['Id']}: {c['claimcategory']}")

    # 3. Find claims that match Director Approved + PPP >= 41 criteria but might be filtered
    # We'll see why they might be filtered (Mode of Payment, SummaryId, or NOT EXISTS)
    query = """
    SELECT 
        h.ApplicationNo, 
        h.Claim_ID,
        h.ModeOfPaymentId,
        h.SummaryId,
        s.PaymentNo,
        h.PPP_PV_Director_approve,
        mc.claimcategory,
        (SELECT COUNT(*) FROM tbl_ar_receipt r WHERE r.ar_id = h.Claim_ID AND r.is_active = 1) as link_count,
        (SELECT COUNT(*) FROM tbl_ar_receipt r WHERE LOWER(r.reference_no) LIKE CONCAT('%', LOWER(TRIM(h.ApplicationNo)), '%') AND r.is_active = 1) as text_count
    FROM tbl_claimAndpayment_header h
    INNER JOIN tbl_PaymentSummary_header s ON h.SummaryId = s.SummaryId
    LEFT JOIN master_claimcategory mc ON h.ClaimCategoryId = mc.Id
    WHERE (h.PPP_PV_Director_approve = 1 OR s.PaymentNo >= 'PPP0000041')
      AND mc.claimcategory = 'Cash Advance'
    ORDER BY s.PaymentNo DESC
    LIMIT 20
    """
    cursor.execute(query)
    claims = cursor.fetchall()
    print("\n--- Diagnostic: Last 20 Cash Advance Claims (Approved or PPP >= 41) ---")
    print(f"{'AppNo':<15} | {'PPP':<15} | {'Mode':<5} | {'SumId':<5} | {'DirApp':<6} | {'Links':<5} | {'TextMatch':<9}")
    for c in claims:
        print(f"{c['ApplicationNo']:<15} | {c['PaymentNo']:<15} | {c['ModeOfPaymentId']:<5} | {c['SummaryId']:<5} | {c['PPP_PV_Director_approve']:<6} | {c['link_count']:<5} | {c['text_count']:<9}")

    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
