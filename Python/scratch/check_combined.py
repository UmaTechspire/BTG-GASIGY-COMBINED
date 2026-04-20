import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

conn = mysql.connector.connect(
    host=os.getenv('DB_HOST'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    database=os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live'),
    port=int(os.getenv('DB_PORT', 3306))
)
cursor = conn.cursor(dictionary=True)

print("=== Checking Combined Voucher Groups 505, 508, 511 ===")
cursor.execute("""
    SELECT receipt_id, transaction_type, cash_amount, bank_amount, reference_no, 
           is_posted, is_submitted, pending_verification, is_combined, 
           combine_group_id, custom_voucher_no, is_active
    FROM tbl_ar_receipt
    WHERE custom_voucher_no IN ('505', '508', '511') OR receipt_id IN (505, 508, 511)
""")
rows = cursor.fetchall()
for r in rows:
    print(r)

print("\n=== Checking Originals for group 511 ===")
# Find group_id for 511 first
cursor.execute("SELECT combine_group_id FROM tbl_ar_receipt WHERE custom_voucher_no = '511' AND is_combined = 1 LIMIT 1")
res = cursor.fetchone()
if res and res['combine_group_id']:
    gid = res['combine_group_id']
    print(f"Group ID for 511: {gid}")
    cursor.execute(f"SELECT * FROM tbl_ar_receipt WHERE combine_group_id = {gid}")
    originals = cursor.fetchall()
    for o in originals:
        print(f"ID: {o['receipt_id']}, Type: {o['transaction_type']}, Cash: {o['cash_amount']}, Posted: {o['is_posted']}, Submitted: {o['is_submitted']}, Active: {o['is_active']}")
else:
    print("No group found for 511")

cursor.close()
conn.close()
