import mysql.connector

conn = mysql.connector.connect(host='76.13.18.34',user='btgsogdbu53r',password='FM0ipR$Zrt9eM',database='btggasify_finance_live')
cursor = conn.cursor()

alter_queries = [
    "ALTER TABLE btggasify_finance_live.Debit_Notes ADD COLUMN GasCodeId INT DEFAULT 0;",
    "ALTER TABLE btggasify_finance_live.Debit_Notes ADD COLUMN Qty DECIMAL(18,2) DEFAULT 1;",
    "ALTER TABLE btggasify_finance_live.Debit_Notes ADD COLUMN UomId INT DEFAULT 0;",
    "ALTER TABLE btggasify_finance_live.Credit_Notes ADD COLUMN GasCodeId INT DEFAULT 0;",
    "ALTER TABLE btggasify_finance_live.Credit_Notes ADD COLUMN Qty DECIMAL(18,2) DEFAULT 1;",
    "ALTER TABLE btggasify_finance_live.Credit_Notes ADD COLUMN UomId INT DEFAULT 0;"
]

for query in alter_queries:
    try:
        cursor.execute(query)
        print(f"Executed: {query}")
    except mysql.connector.Error as err:
        print(f"Error executing {query}: {err}")

conn.commit()
cursor.close()
conn.close()
print("Done altering tables.")
