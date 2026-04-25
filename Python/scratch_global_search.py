import os
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv
import urllib.parse

load_dotenv(dotenv_path='Python/.env')

DB_USER = os.getenv('DB_USER')
DB_PASS = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')

DB_PASS_QUOTED = urllib.parse.quote_plus(DB_PASS)

async def search_everywhere():
    dbs = ['btggasify_live', 'btggasify_finance_live']
    for db in dbs:
        url = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/{db}"
        engine = create_async_engine(url)
        try:
            async with engine.connect() as conn:
                print(f"--- Searching in {db} ---")
                if db == 'btggasify_finance_live':
                    res = await conn.execute(text(f"SELECT * FROM tbl_accounts_receivable WHERE invoice_no LIKE '%90490%'"))
                    rows = res.fetchall()
                    for row in rows:
                        print(f"Found in tbl_accounts_receivable: {row}")
                else:
                    # Check salesinvoices_header
                    res = await conn.execute(text(f"SELECT id, salesinvoicenbr, TotalAmount, customerid FROM tbl_salesinvoices_header WHERE salesinvoicenbr LIKE '%90490%'"))
                    rows = res.fetchall()
                    for row in rows:
                        print(f"Found in tbl_salesinvoices_header: {row}")
                        
                    # Check salesinvoices_details
                    res = await conn.execute(text(f"SELECT salesinvoicesheaderid, DOnumber FROM tbl_salesinvoices_details WHERE DOnumber LIKE '%90490%'"))
                    rows = res.fetchall()
                    for row in rows:
                        print(f"Found in tbl_salesinvoices_details (DO): {row}")
        except Exception as e:
            print(f"Error in {db}: {e}")
        finally:
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(search_everywhere())
