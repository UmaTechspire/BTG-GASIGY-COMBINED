import asyncio
from sqlalchemy import text
from app.database import engine

async def check_allocations(receipt_id: int):
    async with engine.connect() as conn:
        print(f"Checking allocations for receipt_id: {receipt_id}...")
        
        # 1. Check Receipt table
        ra_sql = text("SELECT receipt_id, reference_no, is_submitted FROM btggasify_finance_live.tbl_ar_receipt WHERE receipt_id = :rid")
        ra_res = await conn.execute(ra_sql, {"rid": receipt_id})
        ra_rows = ra_res.fetchall()
        print(f"Found {len(ra_rows)} receipt rows.")
        for row in ra_rows:
            print(f"  Receipt Row: {row}")

        # 1b. Check raw allocations
        alloc_sql = text("SELECT * FROM btggasify_finance_live.tbl_receipt_ag_ar WHERE receipt_id = :rid")
        alloc_res = await conn.execute(alloc_sql, {"rid": receipt_id})
        alloc_rows = alloc_res.fetchall()
        print(f"Found {len(alloc_rows)} raw allocation rows.")
        for row in alloc_rows:
            print(f"  Alloc Row: {row}")

        # 2. Check full join
        join_sql = text("""
            SELECT ra.receipt_id, ra.ar_id, ar.invoice_no, ra.is_active
            FROM btggasify_finance_live.tbl_receipt_ag_ar ra
            JOIN btggasify_finance_live.tbl_accounts_receivable ar ON ra.ar_id = ar.ar_id
            WHERE ra.receipt_id = :rid
        """)
        join_res = await conn.execute(join_sql, {"rid": receipt_id})
        join_rows = join_res.fetchall()
        print(f"Found {len(join_rows)} join rows.")
        for row in join_rows:
            print(f"  Join Row: {row}")

if __name__ == "__main__":
    import sys
    rid = int(sys.argv[1]) if len(sys.argv) > 1 else 403
    asyncio.run(check_allocations(rid))
