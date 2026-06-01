import mysql.connector

conn = mysql.connector.connect(
    host='76.13.18.34', 
    user='btgsogdbu53r', 
    password='FM0ipR$Zrt9eM', 
    database='btggasify_finance_live'
)
cursor = conn.cursor()
try:
    cursor.execute("SHOW GRANTS")
    for row in cursor.fetchall():
        print(row)
except Exception as e:
    print(e)
cursor.close()
conn.close()
