import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_specific_invoice():
    try:
        conn = pymysql.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=int(os.getenv('DB_PORT', 3306)),
            database='btggasify_live'
        )
        with conn.cursor(pymysql.cursors.DictCursor) as cur:
            # Check header flags for 85609
            cur.execute("SELECT id, salesinvoicenbr, IsSubmitted, IsAR, customerid FROM tbl_salesinvoices_header WHERE TRIM(salesinvoicenbr) = '85609'")
            row = cur.fetchone()
            if row:
                print(f"Header 85609: ID {row['id']}, IsSubmitted {row['IsSubmitted']}, IsAR {row['IsAR']}, CustID {row['customerid']}")
            else:
                print("Invoice 85609 not found in tbl_salesinvoices_header")

            # Check AR link for this invoice
            cur.execute("SELECT * FROM btggasify_finance_live.tbl_accounts_receivable WHERE TRIM(invoice_no) = '85609'")
            ar_row = cur.fetchone()
            if ar_row:
                print(f"AR Record: ar_id {ar_row['ar_id']}, invoice_no '{ar_row['invoice_no']}', invoice_id {ar_row['invoice_id']}")
                
                # Check Receipt Link
                cur.execute("SELECT * FROM btggasify_finance_live.tbl_receipt_ag_ar WHERE ar_id = %s", (ar_row['ar_id'],))
                ra_rows = cur.fetchall()
                for ra in ra_rows:
                    print(f"  Receipt Link: receipt_id {ra['receipt_id']}, amount {ra['payment_amount']}, is_active {ra['is_active']}")
            else:
                print("No AR record found for 85609")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    check_specific_invoice()
