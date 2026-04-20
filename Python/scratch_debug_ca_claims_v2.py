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
    # Use Finance DB as default
    finance_db = os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live')
    conn = get_db_connection_sync(finance_db)
    cursor = conn.cursor(dictionary=True)

    print(f"Connected to: {finance_db}")

    # 1. Check Mode of Payment Labels in master DB
    print("\n--- Mode of Payment Masters ---")
    try:
        user_db = os.getenv('DB_NAME_USER', 'btggasify_live')
        cursor.execute(f"SELECT ID, ModeOfPayment FROM {user_db}.master_modeofpayment")
        modes = cursor.fetchall()
        for m in modes:
            print(f"  {m['ID']}: {m['ModeOfPayment']}")
    except Exception as e:
        print(f"  Could not fetch modes: {e}")

    # 2. Check Claim Categories
    print("\n--- Claim Categories in Finance DB ---")
    cursor.execute("SELECT Id, claimcategory FROM master_claimcategory")
    cats = cursor.fetchall()
    for c in cats:
        print(f"  {c['Id']}: {c['claimcategory']}")

    # 3. Check for Cash Advance claims that are Approved and PPP >= 41
    # But see what their ModeOfPaymentId and SummaryId look like
    print("\n--- Diagnostic: Recent Cash Advance Claims ---")
    query = """
    SELECT 
        h.ApplicationNo, 
        h.Claim_ID,
        h.ModeOfPaymentId,
        h.SummaryId,
        s.PaymentNo,
        h.PPP_PV_Director_approve,
        h.IsActive,
        mc.claimcategory,
        (SELECT COUNT(*) FROM tbl_ar_receipt r WHERE (r.ar_id = h.Claim_ID OR r.reference_no LIKE CONCAT('%', h.ApplicationNo, '%')) AND r.is_active = 1) as receipt_count
    FROM tbl_claimAndpayment_header h
    LEFT JOIN tbl_PaymentSummary_header s ON h.SummaryId = s.SummaryId
    LEFT JOIN master_claimcategory mc ON h.ClaimCategoryId = mc.Id
    WHERE (h.PPP_PV_Director_approve = 1 OR s.PaymentNo >= 'PPP0000041')
      AND mc.claimcategory = 'Cash Advance'
    ORDER BY h.Claim_ID DESC
    LIMIT 15
    """
    cursor.execute(query)
    claims = cursor.fetchall()
    print(f"{'AppNo':<20} | {'PPP':<15} | {'Mode':<4} | {'SumId':<5} | {'DirApp':<6} | {'Active':<6} | {'Receipts':<8}")
    for c in claims:
        print(f"{c['ApplicationNo']:<20} | {str(c['PaymentNo']):<15} | {c['ModeOfPaymentId']:<4} | {c['SummaryId']:<5} | {c['PPP_PV_Director_approve']:<6} | {c['IsActive']:<6} | {c['receipt_count']:<8}")

    # 4. Check specifically if any match the criteria but fail ModeOfPaymentId or SummaryId
    print("\n--- Claims that fail specific filters ---")
    query_fail = """
    SELECT h.ApplicationNo, h.ModeOfPaymentId, h.SummaryId, h.IsActive, h.PPP_PV_Director_approve
    FROM tbl_claimAndpayment_header h
    LEFT JOIN master_claimcategory mc ON h.ClaimCategoryId = mc.Id
    WHERE mc.claimcategory = 'Cash Advance'
      AND h.PPP_PV_Director_approve = 1
      AND (h.ModeOfPaymentId != 1 OR h.SummaryId IS NULL OR h.SummaryId = 0)
    LIMIT 10
    """
    cursor.execute(query_fail)
    fails = cursor.fetchall()
    for f in fails:
        print(f"  {f['ApplicationNo']}: Mode={f['ModeOfPaymentId']}, SumId={f['SummaryId']}, Active={f['IsActive']}")

    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
