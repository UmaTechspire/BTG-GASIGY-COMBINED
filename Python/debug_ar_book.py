import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def debug_final():
    try:
        conn = pymysql.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=int(os.getenv('DB_PORT', 3306)),
            database='btggasify_finance_live'
        )
        with conn.cursor(pymysql.cursors.DictCursor) as cur:
            # Call procedure
            print("Calling proc_AR_GetARBook(1, 1, 0, '2025-11-01', '2026-03-31')...")
            cur.execute("CALL proc_AR_GetARBook(1, 1, 0, '2025-11-01', '2026-03-31')")
            rows = cur.fetchall()
            
            for row in rows:
                inv_no = str(row.get('invoice_no'))
                if '89611' in inv_no:
                    print(f"ROW: {row['payment_mode']} | Ref: {row['invoice_no']} | Inv: {row['invoice_amount']} | Rec: {row['receipt_amount']} | TotalRec: {row.get('total_receipt_amount')} | Bal: {row['balance']}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    debug_final()
