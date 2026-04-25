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

async def check_missing_desc():
    url_live = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/btggasify_live"
    engine_live = create_async_engine(url_live)
    
    invoices = ['90470', '90466', '90468', '90469', '90471']
    
    try:
        async with engine_live.connect() as conn:
            for inv in invoices:
                print(f"\n--- Checking Invoice {inv} ---")
                res = await conn.execute(text("SELECT id, salesinvoicenbr, TotalAmount FROM tbl_salesinvoices_header WHERE salesinvoicenbr = :inv"), {"inv": inv})
                header = res.fetchone()
                print(f"Header: {header}")
                
                if header:
                    hid = header[0]
                    res2 = await conn.execute(text("""
                        SELECT d.id, d.gascodeid, g.GasName, d.PickedQty, d.UnitPrice, d.TotalPrice 
                        FROM tbl_salesinvoices_details d
                        LEFT JOIN master_gascode g ON d.gascodeid = g.Id
                        WHERE d.salesinvoicesheaderid = :hid
                    """), {"hid": hid})
                    details = res2.fetchall()
                    if not details:
                        print("NO DETAILS FOUND!")
                    for row in details:
                        print(row)
                        
    finally:
        await engine_live.dispose()

if __name__ == "__main__":
    asyncio.run(check_missing_desc())
