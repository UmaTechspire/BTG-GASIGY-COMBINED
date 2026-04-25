import asyncio
import os
from sqlalchemy import text
from app.database import engine

async def main():
    try:
        async with engine.connect() as conn:
            DB_USER = os.getenv('DB_NAME_USER', 'btggasify_live')
            print(f"Checking columns for {DB_USER}.tbl_salesinvoices_details...")
            
            res = await conn.execute(text(f"DESCRIBE {DB_USER}.tbl_salesinvoices_details"))
            for col in res.fetchall():
                print(col)
            
            print(f"\nChecking columns for {DB_USER}.tbl_salesinvoices_header...")
            res = await conn.execute(text(f"DESCRIBE {DB_USER}.tbl_salesinvoices_header"))
            for col in res.fetchall():
                print(col)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
