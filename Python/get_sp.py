import mysql.connector

conn = mysql.connector.connect(
    host='76.13.18.34', 
    user='btgsogdbu53r', 
    password='FM0ipR$Zrt9eM', 
    database='btggasify_finance_live'
)
cursor = conn.cursor()
cursor.execute("SHOW CREATE PROCEDURE proc_AR_GetOutstandingInvoices")
print(cursor.fetchone()[2])
cursor.close()
conn.close()
