import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

conn = mysql.connector.connect(
    host=os.getenv('DB_HOST'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    database=os.getenv('DB_NAME_PURCHASE', 'btggasify_purchase_live'),
    port=int(os.getenv('DB_PORT', 3306))
)
cursor = conn.cursor(dictionary=True)

print("=== 1. GRN Detail Columns ===")
cursor.execute("SELECT * FROM tbl_grn_detail LIMIT 2")
rows = cursor.fetchall()
if rows:
    print("Columns:", list(rows[0].keys()))
    for r in rows:
        interesting = {k: v for k, v in r.items() if any(x in k.lower() for x in ['po', 'id', 'no', 'val', 'qty'])}
        print(interesting)
else:
    print("No rows")

print("\n=== 2. GRN Header + Detail JOIN (to get poid from detail) ===")
cursor.execute("""
    SELECT h.grnid, h.grnno, h.grndate, h.supplierid, h.grnvalue,
           d.poid, p.pono, p.nettotal
    FROM tbl_grn_header h
    LEFT JOIN tbl_grn_detail d ON d.grnid = h.grnid
    LEFT JOIN tbl_purchaseorder_header p ON p.poid = d.poid
    LIMIT 5
""")
[print(r) for r in cursor.fetchall()]

print("\n=== 3. PO amount field name check ===")
cursor.execute("SELECT poid, pono, nettotal, subtotal FROM tbl_purchaseorder_header WHERE poid IN (SELECT DISTINCT poid FROM tbl_grn_detail WHERE poid > 0 LIMIT 5)")
[print(r) for r in cursor.fetchall()]

cursor.close()
conn.close()
print("\nDone.")
