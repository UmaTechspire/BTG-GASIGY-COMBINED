import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_db():
    try:
        conn = pymysql.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=int(os.getenv('DB_PORT', 3306))
        )
        with conn.cursor() as cur:
            # 1. Check if IsAR column exists in tbl_salesinvoices_header
            print("Checking schema...")
            cur.execute(f"SHOW COLUMNS FROM {os.getenv('DB_NAME_USER', 'btggasify_live')}.tbl_salesinvoices_header LIKE 'IsAR'")
            row = cur.fetchone()
            if row:
                print(f"  Column IsAR exists in tbl_salesinvoices_header")
            else:
                print(f"  Column IsAR MISSING in tbl_salesinvoices_header")

            # 2. Check if invoice_amt_idr exists in tbl_accounts_receivable
            cur.execute(f"SHOW COLUMNS FROM {os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live')}.tbl_accounts_receivable LIKE 'invoice_amt_idr'")
            row = cur.fetchone()
            if row:
                print(f"  Column invoice_amt_idr exists in tbl_accounts_receivable")
            else:
                print(f"  Column invoice_amt_idr MISSING in tbl_accounts_receivable")

            # 3. Test proc_DSI_GetDONumberString with a random ID (or just check existence)
            cur.execute(f"SELECT SPECIFIC_NAME FROM information_schema.ROUTINES WHERE SPECIFIC_NAME = 'proc_DSI_GetDONumberString' AND SPECIFIC_SCHEMA = '{os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live')}'")
            if cur.fetchone():
                print("  Procedure proc_DSI_GetDONumberString found")
            else:
                print("  Procedure proc_DSI_GetDONumberString MISSING")

    except Exception as e:
        print(f"Error during check: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    check_db()
