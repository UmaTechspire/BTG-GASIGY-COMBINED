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

async def find_duplicates():
    url_live = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/btggasify_live"
    engine_live = create_async_engine(url_live)
    
    try:
        async with engine_live.connect() as conn:
            print("--- Finding Duplicate Invoice Numbers in tbl_salesinvoices_header ---")
            query = text("""
                SELECT salesinvoicenbr, COUNT(*) as occurrence_count 
                FROM tbl_salesinvoices_header 
                GROUP BY salesinvoicenbr 
                HAVING COUNT(*) > 1
                ORDER BY occurrence_count DESC
            """)
            res = await conn.execute(query)
            dupes = res.fetchall()
            
            if not dupes:
                print("No duplicate invoice numbers found.")
            else:
                print(f"Found {len(dupes)} duplicate invoice numbers:")
                for row in dupes:
                    print(f"Invoice: {row[0]}, Count: {row[1]}")
                    
    finally:
        await engine_live.dispose()

if __name__ == "__main__":
    asyncio.run(find_duplicates())
