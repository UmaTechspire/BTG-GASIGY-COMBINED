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

async def check_org():
    url_live = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/btggasify_live"
    engine_live = create_async_engine(url_live)
    
    try:
        async with engine_live.connect() as conn:
            print("--- Checking Org/Branch for Header 8297 ---")
            res = await conn.execute(text("SELECT OrgId, BranchId FROM tbl_salesinvoices_header WHERE id = 8297"))
            print(res.fetchone())
            
            print("--- Checking Org/Branch for Gas 1704 ---")
            res = await conn.execute(text("SELECT OrgId, BranchId FROM master_gascode WHERE Id = 1704"))
            print(res.fetchone())
                
    finally:
        await engine_live.dispose()

if __name__ == "__main__":
    asyncio.run(check_org())
