import os
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv

import urllib.parse

load_dotenv(dotenv_path='Python/.env')

DB_USER = os.getenv('DB_USER', 'btgsogdbu53r')
DB_PASS = os.getenv('DB_PASSWORD', 'FM0ipR$Zrt9eM')
DB_HOST = os.getenv('DB_HOST', '76.13.18.34')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_FINANCE = os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live')

DB_PASS_QUOTED = urllib.parse.quote_plus(DB_PASS)
DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/{DB_FINANCE}"

async def test_sp():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        # Test for PO0001396 from the screenshot
        # We'll use supplier_id=0 to get all for now
        query = text("CALL proc_AP_AccountsPayableLedger(0, 0, '2025-04-01', '2026-04-24')")
        result = await conn.execute(query)
        rows = result.fetchall()
        
        print(f"{'PO No':<15} | {'GRN No':<15} | {'IRN No':<15} | {'Claim No':<15} | {'IRN Amt':<10} | {'Claim Amt':<10} | {'Paid'} | {'Voucher'}")
        print("-" * 120)
        for row in rows:
            # 0:poid, 1:po_no, 2:po_date, 3:po_amount, 4:grnid, 5:grn_no, 6:grn_date, 7:irn_id, 8:irn_no, 9:irn_date, 10:claim_no, 11:claim_date, 12:claim_id, 13:voucher_no, 14:is_paid, 15:irn_amount, 16:claim_amount, 17:claim_header_amount
            print(f"{str(row[1]):<15} | {str(row[5]):<15} | {str(row[8]):<15} | {str(row[10]):<15} | {str(row[15]):<10} | {str(row[16]):<10} | {str(row[14]):<4} | {str(row[13])}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_sp())
