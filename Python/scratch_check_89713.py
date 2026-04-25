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

async def check_89713():
    url_live = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/btggasify_live"
    engine_live = create_async_engine(url_live)
    
    try:
        async with engine_live.connect() as conn:
            print("--- Header for 89713 ---")
            res = await conn.execute(text("SELECT id, salesinvoicenbr, TotalAmount FROM tbl_salesinvoices_header WHERE salesinvoicenbr = '89713'"))
            header = res.fetchone()
            print(header)
            
            if header:
                hid = header[0]
                print("\n--- Details for 89713 ---")
                res2 = await conn.execute(text("SELECT id, gascodeid, PickedQty, UnitPrice, TotalPrice FROM tbl_salesinvoices_details WHERE salesinvoicesheaderid = :hid"), {"hid": hid})
                details = res2.fetchall()
                for row in details:
                    print(row)
                
                print(f"\nSum of TotalPrice: {sum(row[4] for row in details)}")
                
    finally:
        await engine_live.dispose()

if __name__ == "__main__":
    asyncio.run(check_89713())
