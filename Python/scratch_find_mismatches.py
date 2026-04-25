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

async def find_mismatches():
    url_live = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/btggasify_live"
    engine_live = create_async_engine(url_live)
    
    try:
        async with engine_live.connect() as conn:
            print("--- Finding Header/Detail Mismatches ---")
            query = text("""
                SELECT 
                    h.salesinvoicenbr, 
                    h.TotalAmount as header_total, 
                    d_sum.detail_sum
                FROM tbl_salesinvoices_header h
                JOIN (
                    SELECT salesinvoicesheaderid, SUM(TotalPrice) as detail_sum
                    FROM tbl_salesinvoices_details
                    GROUP BY salesinvoicesheaderid
                ) d_sum ON h.id = d_sum.salesinvoicesheaderid
                WHERE ABS(h.TotalAmount - d_sum.detail_sum) > 0.01
                ORDER BY h.Salesinvoicesdate DESC
            """)
            res = await conn.execute(query)
            rows = res.fetchall()
            for row in rows:
                print(f"Invoice: {row[0]}, Header: {row[1]}, Details: {row[2]}, Diff: {row[1] - row[2]}")
                
    finally:
        await engine_live.dispose()

if __name__ == "__main__":
    asyncio.run(find_mismatches())
