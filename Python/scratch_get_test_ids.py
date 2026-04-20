import asyncio
import os
from sqlalchemy import text
from app.database import engine

async def main():
    async with engine.connect() as conn:
        DB_USER = os.getenv('DB_NAME_USER', 'btggasify_live')
        
        # Get a random customer
        result = await conn.execute(text(f"SELECT Id, CustomerName FROM {DB_USER}.tbl_customer WHERE isactive=1 LIMIT 1"))
        customer = result.first()
        
        # Get a random gas item
        result = await conn.execute(text(f"SELECT Id, GasName FROM {DB_USER}.tbl_gascode WHERE isactive=1 LIMIT 1"))
        gas = result.first()
        
        print(f"Test Customer: ID {customer[0]}, Name {customer[1]}")
        print(f"Test Gas: ID {gas[0]}, Name {gas[1]}")

if __name__ == "__main__":
    asyncio.run(main())
