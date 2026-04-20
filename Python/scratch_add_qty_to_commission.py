import asyncio
import os
import sys
from sqlalchemy import text
from app.database import engine

async def main():
    try:
        async with engine.begin() as conn:
            DB_NAME_MASTER = os.getenv('DB_NAME_MASTER', 'btggasify_masterpanel_live')
            
            # Use raw connection to execute potentially multiple statements? Or sqlalchemy `text` one by one
            
            print("Adding Qty to master_salesCommission_details...")
            try:
                await conn.execute(text(f"""
                ALTER TABLE {DB_NAME_MASTER}.master_salesCommission_details
                ADD COLUMN Qty DECIMAL(10,2) DEFAULT 1 AFTER Rate;
                """))
                print("Added to master.")
            except Exception as e:
                print(f"Error adding to master: {e}")
                
            print("Adding Qty to log_salesCommission_details...")
            try:
                await conn.execute(text(f"""
                ALTER TABLE {DB_NAME_MASTER}.log_salesCommission_details
                ADD COLUMN Qty DECIMAL(10,2) DEFAULT 1 AFTER Rate;
                """))
                print("Added to log.")
            except Exception as e:
                print(f"Error adding to log: {e}")
                
            print("Adding SellingPrice to tbl_salesinvoices_details...")
            DB_NAME_USER = os.getenv('DB_NAME_USER', 'btggasify_live')
            try:
                await conn.execute(text(f"""
                ALTER TABLE {DB_NAME_USER}.tbl_salesinvoices_details
                ADD COLUMN SellingPrice DECIMAL(18,2) DEFAULT 0,
                ADD COLUMN SellingTotal DECIMAL(18,2) DEFAULT 0;
                """))
                print("Added to invoice details.")
            except Exception as e:
                print(f"Error adding to invoice details: {e}")

    except Exception as e:
        print(f"Connection error: {e}")
        
if __name__ == "__main__":
    asyncio.run(main())
