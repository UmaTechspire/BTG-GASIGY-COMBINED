import asyncio
import os
from sqlalchemy import text
from app.database import engine

async def main():
    try:
        async with engine.connect() as conn:
            DB_PURCHASE = os.getenv('DB_NAME_PURCHASE', 'btggasify_purchase_live')
            DB_FINANCE = os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live')
            
            tables_to_check = [
                (DB_PURCHASE, 'tbl_IRNReceipt_detail'),
                (DB_PURCHASE, 'tbl_grn_header'),
                (DB_PURCHASE, 'tbl_purchaseorder_header'),
                (DB_FINANCE, 'tbl_claimAndpayment_header')
            ]
            
            for db, table in tables_to_check:
                print(f"\n--- Schema for {db}.{table} ---")
                try:
                    res = await conn.execute(text(f"DESCRIBE {db}.{table}"))
                    for col in res.fetchall():
                        print(col)
                except Exception as e:
                    print(f"Could not describe {table}: {e}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
