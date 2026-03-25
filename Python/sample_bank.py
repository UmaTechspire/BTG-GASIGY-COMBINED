import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

def main():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME_MASTER', 'btggasify_masterpanel_live'),
            ssl_disabled=True
        )
        cursor = conn.cursor()
        
        cursor.execute("SELECT BankId, BankName, COA, AccountNumber, Description FROM master_bank LIMIT 10")
        rows = cursor.fetchall()
        for row in rows:
            print(row)
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'cursor' in locals() and cursor: cursor.close()
        if 'conn' in locals() and conn: conn.close()

if __name__ == "__main__":
    main()
