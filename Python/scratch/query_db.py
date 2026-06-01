import mysql.connector
conn = mysql.connector.connect(host='76.13.18.34', user='btgsogdbu53r', password='FM0ipR$Zrt9eM', database='btggasify_live')
cursor = conn.cursor()
cursor.execute('SHOW TABLES LIKE "%supplier%"')
print("Supplier tables:")
for row in cursor.fetchall(): print(row)
cursor.execute('SHOW COLUMNS FROM tbl_salesinvoices_header')
print("tbl_salesinvoices_header columns:")
for row in cursor.fetchall():
    if "payment" in row[0].lower() or "supplier" in row[0].lower():
        print(row)
