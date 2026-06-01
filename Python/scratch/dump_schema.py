import mysql.connector
conn = mysql.connector.connect(host='76.13.18.34', user='btgsogdbu53r', password='FM0ipR$Zrt9eM', database='btggasify_finance_live')
cursor = conn.cursor()
cursor.execute('DESCRIBE tbl_accounts_receivable')
print("tbl_accounts_receivable:")
for row in cursor.fetchall(): print(row)
