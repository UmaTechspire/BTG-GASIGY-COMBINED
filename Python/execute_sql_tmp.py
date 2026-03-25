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
            database=os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live'),
            ssl_disabled=True
        )
        cursor = conn.cursor()
        
        with open('update_report_sp.sql', 'r') as f:
            sql_file = f.read()

        # Split multiple statements if any, but since it's a DELIMITER script, 
        # python's mysql.connector can be tricky with DELIMITER commands.
        # So we'll parse it.
        # Actually it's just DROP PROCEDURE and CREATE PROCEDURE
        drop_stmt = "DROP PROCEDURE IF EXISTS btggasify_finance_live.proc_Bank_GetReportTransactions;"
        create_stmt = sql_file.split("CREATE PROCEDURE")[1].split("END //")[0]
        create_stmt = "CREATE PROCEDURE" + create_stmt + "END"

        print("Dropping existing SP...")
        cursor.execute(drop_stmt)

        print("Recreating SP...")
        cursor.execute(create_stmt)
        conn.commit()
        print("Done!")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'cursor' in locals() and cursor: cursor.close()
        if 'conn' in locals() and conn: conn.close()

if __name__ == "__main__":
    main()
