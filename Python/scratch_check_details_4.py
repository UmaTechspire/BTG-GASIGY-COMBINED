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

async def check_details_4():
    url_live = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/btggasify_live"
    engine_live = create_async_engine(url_live)
    
    invoices = ['90483', '90484', '90486', '90487', '90488']
    
    try:
        async with engine_live.connect() as conn:
            for inv in invoices:
                print(f"\n--- Invoice {inv} ---")
                res = await conn.execute(text("""
                    SELECT d.id, d.gascodeid, d.PickedQty, d.UnitPrice, d.TotalPrice 
                    FROM tbl_salesinvoices_details d
                    JOIN tbl_salesinvoices_header h ON d.salesinvoicesheaderid = h.id
                    WHERE h.salesinvoicenbr = :inv
                """), {"inv": inv})
                for row in res.fetchall():
                    print(row)
                
    finally:
        await engine_live.dispose()

if __name__ == "__main__":
    asyncio.run(check_details_4())
