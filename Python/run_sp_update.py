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
        
        with open('e:/btg_live_latest3/BTG-GASIFY-COMBINED/Python/update_report_sp.sql', 'r') as f:
            sql = f.read()
            
        # Split by DELIMITER //
        parts = sql.split('//')
        for part in parts:
            p = part.strip()
            if not p: continue
            if 'DELIMITER' in p: continue
            
            # Clean up potential leading/trailing garbage
            p = p.replace('DELIMITER ;', '').strip()
            if p:
                print(f"Executing Part starting with: {p[:50]}...")
                cursor.execute(p)
                
        conn.commit()
        print("Stored Procedure updated successfully.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'cursor' in locals() and cursor: cursor.close()
        if 'conn' in locals() and conn: conn.close()

if __name__ == "__main__":
    main()
