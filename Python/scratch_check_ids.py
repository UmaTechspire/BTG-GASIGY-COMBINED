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

async def check_ids():
    url_finance = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/btggasify_finance_live"
    engine_finance = create_async_engine(url_finance)
    
    try:
        async with engine_finance.connect() as conn:
            print("--- Checking IDs for 90890 in ar ---")
            res = await conn.execute(text("SELECT invoice_id, doid FROM tbl_accounts_receivable WHERE invoice_no = '90890'"))
            print(f"IDs: {res.fetchone()}")
            
    finally:
        await engine_finance.dispose()

if __name__ == "__main__":
    asyncio.run(check_ids())
