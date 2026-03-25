import asyncio
from sqlalchemy import text
from app.database import engine

async def check_schema():
    async with engine.connect() as conn:
        print("Checking schema for tbl_ar_receipt...")
        res = await conn.execute(text("DESCRIBE btggasify_finance_live.tbl_ar_receipt"))
        for row in res.fetchall():
            print(row)

if __name__ == "__main__":
    asyncio.run(check_schema())
