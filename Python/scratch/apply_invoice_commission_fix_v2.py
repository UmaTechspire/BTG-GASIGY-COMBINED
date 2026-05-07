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
# Try the external IP if localhost fails
DB_HOST = '76.13.18.34' 
DB_PORT = os.getenv('DB_PORT', '3306')
DB_NAME_USER = os.getenv('DB_NAME_USER', 'btggasify_live')

DB_PASS_QUOTED = urllib.parse.quote_plus(DB_PASS)
DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/{DB_NAME_USER}"

async def apply_fix():
    print(f"Connecting to: {DB_HOST} / {DB_NAME_USER}")
    engine = create_async_engine(DATABASE_URL)
    try:
        async with engine.begin() as conn:
            print("Applying fix: Setting Id to AUTO_INCREMENT in InvoiceCommission table...")
            await conn.execute(text("ALTER TABLE InvoiceCommission MODIFY COLUMN Id INT AUTO_INCREMENT"))
            print("Successfully updated InvoiceCommission table.")
                
    except Exception as e:
        print(f"Error applying fix: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(apply_fix())
