import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
import asyncio
from dotenv import load_dotenv
import urllib.parse

load_dotenv()

DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_NAME_FINANCE = os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live')

encoded_password = urllib.parse.quote_plus(DB_PASSWORD)
DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{encoded_password}@{DB_HOST}/{DB_NAME_FINANCE}"

async def check_doc_type():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT ar_id, invoice_no, doc_type FROM tbl_accounts_receivable WHERE ar_id IN (12962, 12963)"))
        for row in result:
            print(row)
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_doc_type())
