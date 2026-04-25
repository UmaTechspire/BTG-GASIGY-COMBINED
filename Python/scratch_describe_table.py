import os
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv
import urllib.parse

load_dotenv(dotenv_path='Python/.env')

DB_USER = os.getenv('DB_USER', 'btgsogdbu53r')
DB_PASS = os.getenv('DB_PASSWORD', 'FM0ipR$Zrt9eM')
DB_HOST = os.getenv('DB_HOST', '76.13.18.34')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_FINANCE = os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live')

DB_PASS_QUOTED = urllib.parse.quote_plus(DB_PASS)
DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/{DB_FINANCE}"

async def describe_table():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        result = await conn.execute(text("DESCRIBE tbl_claimAndpayment_header"))
        rows = result.fetchall()
        print("Columns in tbl_claimAndpayment_header:")
        for row in rows:
            print(f"{row[0]} | {row[1]}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(describe_table())
