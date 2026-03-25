import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_proc():
    try:
        conn = pymysql.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=int(os.getenv('DB_PORT', 3306))
        )
        with conn.cursor() as cur:
            cur.execute("SELECT PARAMETER_NAME, DATA_TYPE FROM information_schema.PARAMETERS WHERE SPECIFIC_NAME = 'proc_AR_GetOutstandingInvoices' AND SPECIFIC_SCHEMA = 'btggasify_finance_live'")
            rows = cur.fetchall()
            print("Procedure: proc_AR_GetOutstandingInvoices")
            for row in rows:
                print(f"  Param: {row[0]}, Type: {row[1]}")
            if not rows:
                print("Procedure not found in btggasify_finance_live")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    check_proc()
