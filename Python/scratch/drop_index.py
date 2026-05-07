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

async def drop_index():
    try:
        engine = create_async_engine(DATABASE_URL)
        async with engine.begin() as conn:
            print("Dropping index uk_inv_unique_conditional...")
            await conn.execute(text("ALTER TABLE tbl_accounts_receivable DROP INDEX uk_inv_unique_conditional"))
            print("Index dropped successfully.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(drop_index())
