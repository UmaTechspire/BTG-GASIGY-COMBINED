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

async def search_gases_2():
    url_live = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/btggasify_live"
    engine_live = create_async_engine(url_live)
    
    queries = [
        "PURE HYDROGEN%6.5",
        "LIQUID NITROGEN%DEWAR%10",
        "LIQUID NITROGEN%DEWAR%20",
        "LIQUID NITROGEN%DEWAR%30",
        "LIQUID NITROGEN%DEWAR%8",
        "LIQUID NITROGEN%PORTACRYO%900",
        "NITROGEN ACCUMULATOR%1.5",
        "NITROGEN GAS CUSTOMER 1.5",
        "NITROGEN GAS CUSTOMER 6.4"
    ]
    
    try:
        async with engine_live.connect() as conn:
            for q in queries:
                print(f"--- Searching for {q} ---")
                res = await conn.execute(text(f"SELECT Id, GasName FROM master_gascode WHERE GasName LIKE '%{q}%'"))
                for row in res.fetchall():
                    print(row)
                
    finally:
        await engine_live.dispose()

if __name__ == "__main__":
    asyncio.run(search_gases_2())
