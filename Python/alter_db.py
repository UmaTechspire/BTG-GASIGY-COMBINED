import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

DB_NAME_FINANCE = os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live')

def main():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=DB_NAME_FINANCE,
            ssl_disabled=True
        )
        cursor = conn.cursor()
        
        # Check if column exists
        cursor.execute(f"SHOW COLUMNS FROM tbl_ar_receipt LIKE 'linked_receipt_id'")
        result = cursor.fetchone()
        
        if not result:
            print("Adding linked_receipt_id to tbl_ar_receipt...")
            cursor.execute("ALTER TABLE tbl_ar_receipt ADD COLUMN linked_receipt_id INT NULL;")
            print("Column added successfully.")
        else:
            print("Column linked_receipt_id already exists.")
            
        conn.commit()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'cursor' in locals() and cursor: cursor.close()
        if 'conn' in locals() and conn: conn.close()

if __name__ == "__main__":
    main()
