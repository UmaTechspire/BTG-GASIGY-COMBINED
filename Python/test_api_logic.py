import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def test_query():
    # Attempt to find a verified receipt for ASL SHIPYARD PT
    try:
        conn = pymysql.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=int(os.getenv('DB_PORT', 3306)),
            database='btggasify_finance_live'
        )
        with conn.cursor(pymysql.cursors.DictCursor) as cur:
            # 1. Find Customer ID for ASL SHIPYARD PT
            cur.execute("SELECT Id FROM btggasify_live.master_customer WHERE CustomerName LIKE '%ASL SHIPYARD%'")
            cust = cur.fetchone()
            if not cust:
                print("Customer not found")
                return
            cust_id = cust['Id']
            print(f"Customer ID: {cust_id}")

            # 2. Find a verified receipt for this customer
            cur.execute("SELECT receipt_id FROM tbl_ar_receipt WHERE customer_id = %s AND pending_verification = 0 AND is_active = 1 LIMIT 1", (cust_id,))
            receipt = cur.fetchone()
            if not receipt:
                print("No verified receipt found for this customer")
                # Try to find ANY allocation
                cur.execute("SELECT DISTINCT receipt_id FROM tbl_receipt_ag_ar LIMIT 1")
                receipt = cur.fetchone()
                if not receipt:
                    print("No allocations found at all in tbl_receipt_ag_ar")
                    return
            
            rid = receipt['receipt_id']
            print(f"Testing with Receipt ID: {rid}")

            # 3. Call Procedure
            cur.execute("CALL proc_AR_GetOutstandingInvoices(%s, %s, NULL, NULL)", (cust_id, rid))
            rows = cur.fetchall()
            print(f"Procedure returned {len(rows)} rows")
            for row in rows:
                 if row['allocated_here'] > 0:
                     print(f"  MATCH: Inv {row['invoice_no']}, Allocated: {row['allocated_here']}, Balance: {row['balance_due']}")
                 else:
                     print(f"  (Other): Inv {row['invoice_no']}, Allocated: {row['allocated_here']}, Balance: {row['balance_due']}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    test_query()
