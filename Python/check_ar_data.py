
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

DB_NAME_FINANCE = os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live')

def check_ar():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=DB_NAME_FINANCE
        )
        cursor = conn.cursor(dictionary=True)
        
        invoices = ['90397', '89710']
        for inv in invoices:
            print(f"\n--- Checking Invoice: {inv} ---")
            cursor.execute("SELECT * FROM tbl_accounts_receivable WHERE TRIM(invoice_no) = %s", (inv,))
            rows = cursor.fetchall()
            for row in rows:
                print(f"AR_ID: {row['ar_id']}, InvNo: {row['invoice_no']}, InvAmt: {row['inv_amount']}, IDRAmt: {row['invoice_amt_idr']}, CurrencyId: {row['currencyid']}")
            
            cursor.execute("SELECT * FROM tbl_receipt_ag_ar ra JOIN tbl_ar_receipt r ON ra.receipt_id = r.receipt_id JOIN tbl_accounts_receivable ar ON ra.ar_id = ar.ar_id WHERE TRIM(ar.invoice_no) = %s", (inv,))
            allocs = cursor.fetchall()
            for al in allocs:
                print(f"ReceiptID: {al['receipt_id']}, Allocated: {al['payment_amount']}, AR_InvAmt: {al['inv_amount']}")

        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_ar()
