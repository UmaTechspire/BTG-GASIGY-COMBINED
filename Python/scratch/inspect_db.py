import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
import asyncio
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_NAME_FINANCE = os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live')

# Encode password for URL
import urllib.parse
encoded_password = urllib.parse.quote_plus(DB_PASSWORD)

DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{encoded_password}@{DB_HOST}/{DB_NAME_FINANCE}"

async def inspect_table():
    try:
        engine = create_async_engine(DATABASE_URL)
        async with engine.connect() as conn:
            result = await conn.execute(text("SHOW CREATE TABLE tbl_accounts_receivable"))
            row = result.fetchone()
            if row:
                print(row[1])
            else:
                print("No table found")
        await engine.dispose()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(inspect_table())
