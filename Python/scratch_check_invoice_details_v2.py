import asyncio
import os
from sqlalchemy import text
from app.database import engine

async def main():
    try:
        async with engine.connect() as conn:
            DB_USER = os.getenv('DB_NAME_USER', 'btggasify_live')
            print(f"Database: {DB_USER}")
            
            table = "tbl_salesinvoices_details"
            print(f"Checking for columns in {table}...")
            res = await conn.execute(text(f"DESCRIBE {DB_USER}.{table}"))
            cols = [row[0] for row in res.fetchall()]
            
            for c in ["SellingPrice", "SellingTotal"]:
                if c in cols:
                    print(f"Found: {c}")
                else:
                    item_c = c.lower()
                    if item_c in [x.lower() for x in cols]:
                        matching = [x for x in cols if x.lower() == item_c][0]
                        print(f"Found (Case match): {matching}")
                    else:
                        print(f"MISSING: {c}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
