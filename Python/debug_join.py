import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def find_good_test():
    try:
        conn = pymysql.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=int(os.getenv('DB_PORT', 3306)),
            database='btggasify_finance_live'
        )
        with conn.cursor(pymysql.cursors.DictCursor) as cur:
            # 1. Find the receipt from the screenshot (Inv: 85609) if possible
            # Or just find ANY working example
            cur.execute("""
                SELECT ra.receipt_id, r.customer_id, ar.invoice_no, COUNT(*) as link_count
                FROM tbl_receipt_ag_ar ra
                JOIN tbl_ar_receipt r ON ra.receipt_id = r.receipt_id
                JOIN tbl_accounts_receivable ar ON ra.ar_id = ar.ar_id
                WHERE ra.is_active = 1
                GROUP BY ra.receipt_id, r.customer_id, ar.invoice_no
                LIMIT 5
            """)
            links = cur.fetchall()
            for link in links:
                rid = link['receipt_id']
                cust_id = link['customer_id']
                inv_no = link['invoice_no']
                print(f"\n--- Testing Receipt {rid}, Cust {cust_id}, Inv {inv_no} ---")

                # Check Header
                cur.execute("SELECT id, salesinvoicenbr, customerid FROM btggasify_live.tbl_salesinvoices_header WHERE TRIM(salesinvoicenbr) = %s", (inv_no.strip(),))
                headers = cur.fetchall()
                if not headers:
                    print(f"  !!! CRITICAL: Invoice {inv_no} NOT FOUND in tbl_salesinvoices_header (any customer)")
                    continue
                
                found_for_cust = False
                for h in headers:
                    print(f"  Header Found: ID {h['id']}, Nbr '{h['salesinvoicenbr']}', CustID {h['customerid']}")
                    if h['customerid'] == cust_id:
                        found_for_cust = True
                
                if not found_for_cust:
                    print(f"  !!! MISMATCH: Invoice {inv_no} exists but belongs to a DIFFERENT customer than the receipt (Receipt Cust: {cust_id})")

                # Call Procedure
                cur.execute("CALL proc_AR_GetOutstandingInvoices(%s, %s, NULL, NULL)", (cust_id, rid))
                rows = cur.fetchall()
                match_found = False
                for row in rows:
                    if row['invoice_no'] == inv_no:
                        print(f"  Proc Row: '{row['invoice_no']}', Allocated: {row['allocated_here']}")
                        if float(row['allocated_here']) > 0:
                            match_found = True
                
                if not match_found:
                    print(f"  !!! Proc failed to match this invoice for this receipt.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    find_good_test()
