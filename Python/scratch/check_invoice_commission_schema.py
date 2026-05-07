import os
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv
import urllib.parse

# Load environment variables
load_dotenv(dotenv_path='Python/.env')

DB_USER = os.getenv('DB_USER')
DB_PASS = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
DB_NAME_USER = os.getenv('DB_NAME_USER', 'btggasify_live')

DB_PASS_QUOTED = urllib.parse.quote_plus(DB_PASS)
DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/{DB_NAME_USER}"

async def check_schema():
    print(f"Connecting to: {DB_HOST} / {DB_NAME_USER}")
    engine = create_async_engine(DATABASE_URL)
    try:
        async with engine.connect() as conn:
            print(f"--- DESCRIBE {DB_NAME_USER}.InvoiceCommission ---")
            try:
                result = await conn.execute(text("DESCRIBE InvoiceCommission"))
                rows = result.fetchall()
                for row in rows:
                    print(f"Field: {row[0]} | Type: {row[1]} | Null: {row[2]} | Key: {row[3]} | Default: {row[4]} | Extra: {row[5]}")
            except Exception as inner_e:
                print(f"Error describing table: {inner_e}")
                
            print("\n--- SHOW CREATE TABLE InvoiceCommission ---")
            try:
                result = await conn.execute(text("SHOW CREATE TABLE InvoiceCommission"))
                row = result.fetchone()
                if row:
                    print(row[1])
            except Exception as inner_e:
                print(f"Error showing create table: {inner_e}")
                
    except Exception as e:
        print(f"Connection Error: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_schema())
