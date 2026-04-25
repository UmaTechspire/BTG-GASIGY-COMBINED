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

async def check_masterpanel():
    url_mp = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/btggasify_masterpanel_live"
    engine_mp = create_async_engine(url_mp)
    
    try:
        async with engine_mp.connect() as conn:
            print("--- Checking Masterpanel Headers ---")
            res = await conn.execute(text("SELECT id, salesinvoicenbr FROM tbl_salesinvoices_header WHERE salesinvoicenbr IN ('90523', '90524', '90542', '90545')"))
            for row in res.fetchall():
                print(row)
                
    finally:
        await engine_mp.dispose()

if __name__ == "__main__":
    asyncio.run(check_masterpanel())
