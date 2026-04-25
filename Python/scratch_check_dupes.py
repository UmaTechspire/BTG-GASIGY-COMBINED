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

async def check_dupes():
    dbs = {
        'live': 'btggasify_live',
        'finance': 'btggasify_finance_live'
    }
    
    url_live = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/{dbs['live']}"
    url_finance = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/{dbs['finance']}"
    
    engine_live = create_async_engine(url_live)
    engine_finance = create_async_engine(url_finance)
    
    try:
        # Check 88932
        print("--- Checking Invoice 88932 ---")
        async with engine_live.connect() as conn:
            res = await conn.execute(text("SELECT id, salesinvoicenbr, TotalAmount, IsSubmitted, IsAR FROM tbl_salesinvoices_header WHERE salesinvoicenbr = '88932'"))
            print(f"In tbl_salesinvoices_header: {res.fetchall()}")
            
        async with engine_finance.connect() as conn:
            res = await conn.execute(text("SELECT ar_id, invoice_no, inv_amount, balance_amount, is_active, transaction_no FROM tbl_accounts_receivable WHERE invoice_no = '88932'"))
            print(f"In tbl_accounts_receivable: {res.fetchall()}")

        # Check 90490 again
        print("\n--- Checking Invoice 90490 ---")
        async with engine_live.connect() as conn:
            res = await conn.execute(text("SELECT id, salesinvoicenbr, TotalAmount FROM tbl_salesinvoices_header WHERE salesinvoicenbr = '90490'"))
            print(f"In tbl_salesinvoices_header: {res.fetchall()}")
            
        async with engine_finance.connect() as conn:
            res = await conn.execute(text("SELECT ar_id, invoice_no, inv_amount, balance_amount, is_active FROM tbl_accounts_receivable WHERE invoice_no = '90490'"))
            print(f"In tbl_accounts_receivable: {res.fetchall()}")

    finally:
        await engine_live.dispose()
        await engine_finance.dispose()

if __name__ == "__main__":
    asyncio.run(check_dupes())
