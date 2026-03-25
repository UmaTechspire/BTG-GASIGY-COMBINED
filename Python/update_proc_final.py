import asyncio
from sqlalchemy import text
from app.database import AsyncSessionLocal

async def update_proc():
    sql = """
    DROP PROCEDURE IF EXISTS proc_Bank_GetDailyEntries;
    """
    
    proc_sql = """
    CREATE PROCEDURE proc_Bank_GetDailyEntries()
    BEGIN
        SELECT 
            r.receipt_id,
            COALESCE(r.receipt_date, r.created_date) as date,
            r.customer_id,
            r.transaction_type,
            CASE 
                WHEN r.transaction_type = 'Bank transfer' THEN COALESCE(pb.BankName, 'Unknown Bank')
                WHEN r.transaction_type = 'Bank Interest' THEN 'N/A'
                WHEN r.bank_amount < 0 AND r.customer_id != 0 THEN COALESCE(s.SupplierName, 'Unknown Supplier')
                WHEN r.customer_id = 0 AND r.reference_no LIKE 'CLM%' THEN SUBSTRING_INDEX(r.reference_no, ' - ', -1)
                ELSE COALESCE(c.CustomerName, 'Unknown Customer')
            END as customerName,
            r.bank_amount,
            r.deposit_bank_id,
            r.reference_no,
            r.sales_person_id,
            r.send_notification,
            r.is_posted, 
            r.pending_verification, 
            r.is_submitted,
            CASE WHEN r.is_posted = 1 THEN 'P' ELSE 'S' END as status_code,
            CASE 
                WHEN r.is_posted = 1 AND r.pending_verification = 1 THEN 'Pending'
                WHEN r.is_posted = 1 AND r.pending_verification = 0 THEN 'Completed'
                ELSE NULL 
            END as verification_status,
            COALESCE(b.BankName, 'Unknown Bank') as bank_name,
            COALESCE(mc.CurrencyCode, 'IDR') as CurrencyCode,
            r.bank_charges,
            r.currencyid,
            r.combine_group_id
        FROM btggasify_finance_live.tbl_ar_receipt r
        LEFT JOIN btggasify_live.master_customer c ON r.customer_id = c.Id
        LEFT JOIN btggasify_masterpanel_live.master_supplier s ON r.customer_id = s.SupplierId
        LEFT JOIN btggasify_masterpanel_live.master_bank b ON CAST(NULLIF(r.deposit_bank_id, '') AS UNSIGNED) = b.BankId
        LEFT JOIN btggasify_masterpanel_live.master_bank pb ON r.customer_id = pb.BankId
        LEFT JOIN btggasify_live.master_currency mc ON r.currencyid = mc.CurrencyId
        WHERE r.bank_amount != 0
          AND r.is_active = 1
          AND (r.reference_no NOT LIKE 'CLM%' OR r.reference_no IS NULL)
          AND IFNULL(r.is_submitted, 0) = 0
        ORDER BY r.receipt_id DESC;
    END
    """
    
    async with AsyncSessionLocal() as session:
        try:
            await session.execute(text(sql))
            await session.execute(text(proc_sql))
            await session.commit()
            print("Successfully updated proc_Bank_GetDailyEntries")
        except Exception as e:
            print(f"Error: {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(update_proc())
