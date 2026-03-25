import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_proc_body():
    try:
        conn = pymysql.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=int(os.getenv('DB_PORT', 3306))
        )
        with conn.cursor() as cur:
            cur.execute("SHOW CREATE PROCEDURE btggasify_finance_live.proc_AR_GetOutstandingInvoices")
            row = cur.fetchone()
            print("Procedure Body:")
            print(row[2])
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    check_proc_body()
