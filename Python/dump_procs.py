import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv('d:\\OFFICIAL\\BTG\\BETA LATEST CODE\\BTG-GASIFY-COMBINED\\Python\\.env')

try:
    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live')
    )
    cursor = conn.cursor()
    cursor.execute("SHOW CREATE PROCEDURE proc_Bank_GetDailyEntries")
    res = cursor.fetchone()
    print("----- PROC_BANK_GETDAILYENTRIES -----")
    print(res[2] if res else "Not found")
    
    cursor.execute("SHOW CREATE PROCEDURE proc_Cash_GetDailyEntries")
    res = cursor.fetchone()
    print("----- PROC_CASH_GETDAILYENTRIES -----")
    print(res[2] if res else "Not found")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
