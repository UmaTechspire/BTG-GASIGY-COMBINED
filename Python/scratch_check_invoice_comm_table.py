import asyncio
import os
from sqlalchemy import text
from app.database import engine

async def main():
    try:
        async with engine.connect() as conn:
            DB_USER = os.getenv('DB_NAME_USER', 'btggasify_live')
            print(f"Checking database: {DB_USER}")
            
            # List all tables to see if a commission table exists
            result = await conn.execute(text(f"SHOW TABLES FROM {DB_USER}"))
            tables = [row[0] for row in result.fetchall()]
            comm_tables = [t for t in tables if 'comm' in t.lower()]
            
            print(f"Commission-related tables: {comm_tables}")
            
            if 'tbl_salesinvoices_commission' in tables:
                print("Checking schema for tbl_salesinvoices_commission...")
                res = await conn.execute(text(f"DESCRIBE {DB_USER}.tbl_salesinvoices_commission"))
                for col in res.fetchall():
                    print(col)
            else:
                print("tbl_salesinvoices_commission does not exist.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
