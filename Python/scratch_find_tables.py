import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

conn = mysql.connector.connect(
    host=os.getenv('DB_HOST'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    database=os.getenv('DB_NAME_PURCHASE', 'btggasify_purchase_live'),
    port=int(os.getenv('DB_PORT', 3306))
)
cursor = conn.cursor()

print("=== Tables with 'grn' ===")
cursor.execute("SHOW TABLES LIKE '%grn%'")
[print(r) for r in cursor.fetchall()]

print("\n=== Tables with 'purchase' ===")
cursor.execute("SHOW TABLES LIKE '%purchase%'")
[print(r) for r in cursor.fetchall()]

cursor.close()
conn.close()
