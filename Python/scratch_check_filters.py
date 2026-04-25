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

async def check_filters():
    url_live = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/btggasify_live"
    engine_live = create_async_engine(url_live)
    
    try:
        async with engine_live.connect() as conn:
            print("--- Checking Filters for 90890 ---")
            res = await conn.execute(text("SELECT id, salesinvoicenbr, IsSubmitted, IsAR FROM tbl_salesinvoices_header WHERE salesinvoicenbr = '90890'"))
            print(f"Header Flags: {res.fetchone()}")
            
            print("\n--- Checking if 90890 is a DOnumber in details ---")
            res2 = await conn.execute(text("SELECT DISTINCT DOnumber FROM tbl_salesinvoices_details WHERE DOnumber = '90890'"))
            print(f"Is DOnumber: {res2.fetchone()}")
            
    finally:
        await engine_live.dispose()

if __name__ == "__main__":
    asyncio.run(check_filters())
