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
            # 1. Find a receipt that HAS allocations
            cur.execute("""
                SELECT ra.receipt_id, r.customer_id, COUNT(*) as link_count
                FROM tbl_receipt_ag_ar ra
                JOIN tbl_ar_receipt r ON ra.receipt_id = r.receipt_id
                WHERE ra.is_active = 1
                GROUP BY ra.receipt_id, r.customer_id
                LIMIT 1
            """)
            link = cur.fetchone()
            if not link:
                print("No receipts with active allocations found in tbl_receipt_ag_ar")
                return
            
            rid = link['receipt_id']
            cust_id = link['customer_id']
            print(f"Testing with Receipt ID: {rid}, Customer ID: {cust_id} (Links: {link['link_count']})")

            # 2. Call Procedure
            cur.execute("CALL proc_AR_GetOutstandingInvoices(%s, %s, NULL, NULL)", (cust_id, rid))
            rows = cur.fetchall()
            print(f"Procedure returned {len(rows)} rows")
            matches = 0
            for row in rows:
                 if float(row['allocated_here']) > 0:
                     print(f"  MATCH: Inv {row['invoice_no']}, Allocated: {row['allocated_here']}, Balance: {row['balance_due']}")
                     matches += 1
            
            if matches == 0:
                 print("  WARNING: Procedure returned NO matches even though we know allocations exist for this receipt.")
                 
                 # Debug: Check why the join failed in the Proc
                 print("\nDebugging join for this receipt...")
                 cur.execute("""
                    SELECT ra.*, ar.invoice_no, ar.invoice_id as ar_inv_id
                    FROM tbl_receipt_ag_ar ra
                    JOIN tbl_accounts_receivable ar ON ra.ar_id = ar.ar_id
                    WHERE ra.receipt_id = %s AND ra.is_active = 1
                 """, (rid,))
                 debug_rows = cur.fetchall()
                 for d in debug_rows:
                     print(f"  Link: AR_ID {d['ar_id']}, InvNo {d['invoice_no']}, AR_InvoiceID {d['ar_inv_id']}")
                     # Check if this Invoice No exists for this customer in header
                     cur.execute("SELECT id, salesinvoicenbr FROM btggasify_live.tbl_salesinvoices_header WHERE customerid = %s AND TRIM(salesinvoicenbr) = %s", (cust_id, d['invoice_no'].strip()))
                     h = cur.fetchone()
                     if h:
                         print(f"    -> Found Header: ID {h['id']}, Nbr {h['salesinvoicenbr']}")
                         if h['id'] != d['ar_inv_id']:
                             print(f"    !!! MISMATCH: Header ID {h['id']} != AR table ID {d['ar_inv_id']}")
                     else:
                         print(f"    !!! NOT FOUND in headers for this customer.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    find_good_test()
