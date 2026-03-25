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
            # 1. Check parameters for proc_Bank_GetOpeningBalance
            print("Checking proc_Bank_GetOpeningBalance parameters...")
            cur.execute("""
                SELECT PARAMETER_NAME, DATA_TYPE, ORDINAL_POSITION 
                FROM information_schema.PARAMETERS 
                WHERE SPECIFIC_NAME = 'proc_Bank_GetOpeningBalance' 
                AND SPECIFIC_SCHEMA = 'btggasify_finance_live'
                ORDER BY ORDINAL_POSITION
            """)
            rows = cur.fetchall()
            if rows:
                print(f"  Found {len(rows)} parameters:")
                for row in rows:
                    print(f"    Param {row[2]}: {row[0]} ({row[1]})")
            else:
                print("  Procedure proc_Bank_GetOpeningBalance NOT FOUND in btggasify_finance_live")

    except Exception as e:
        print(f"Error during check: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    check_db()
