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

async def check_details_finance():
    url_finance = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/btggasify_finance_live"
    engine_finance = create_async_engine(url_finance)
    
    # Need to find the header IDs in finance first
    try:
        async with engine_finance.connect() as conn:
            print("--- Checking Headers in Finance ---")
            res = await conn.execute(text("SELECT id, salesinvoicenbr FROM tbl_salesinvoices_header WHERE salesinvoicenbr IN ('90523', '90524', '90542', '90545')"))
            h_rows = res.fetchall()
            for row in h_rows:
                print(row)
            
            if h_rows:
                h_ids = [r[0] for r in h_rows]
                print("--- Checking Details in Finance ---")
                res = await conn.execute(text("SELECT * FROM tbl_salesinvoices_details WHERE salesinvoicesheaderid IN :ids"), {"ids": tuple(h_ids)})
                for row in res.fetchall():
                    print(row)
                
    finally:
        await engine_finance.dispose()

if __name__ == "__main__":
    asyncio.run(check_details_finance())
