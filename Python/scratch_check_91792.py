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

async def check_91792():
    url_live = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/btggasify_live"
    url_finance = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/btggasify_finance_live"
    
    engine_live = create_async_engine(url_live)
    engine_finance = create_async_engine(url_finance)
    
    try:
        async with engine_live.connect() as conn_live:
            print("--- Checking Marketing (91792) ---")
            res = await conn_live.execute(text("SELECT id, salesinvoicenbr, TotalAmount FROM tbl_salesinvoices_header WHERE salesinvoicenbr = '91792'"))
            header = res.fetchone()
            print(f"Header: {header}")
            
        async with engine_finance.connect() as conn_finance:
            print("\n--- Checking Finance (91792) ---")
            res = await conn_finance.execute(text("SELECT ar_id, invoice_no, inv_amount, already_received FROM tbl_accounts_receivable WHERE invoice_no = '91792'"))
            ar = res.fetchone()
            print(f"AR Record: {ar}")
            
            if ar:
                arid = ar[0]
                print("\n--- Checking Receipts for 91792 ---")
                res2 = await conn_finance.execute(text("SELECT receipt_id, payment_amount FROM tbl_receipt_ag_ar WHERE ar_id = :arid AND is_active = 1"), {"arid": arid})
                receipts = res2.fetchall()
                print(f"Receipts: {receipts}")
                
    finally:
        await engine_live.dispose()
        await engine_finance.dispose()

if __name__ == "__main__":
    asyncio.run(check_91792())
