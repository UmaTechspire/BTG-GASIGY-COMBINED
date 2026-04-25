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
DB_NAME_LIVE = 'btggasify_live'
DB_NAME_FINANCE = 'btggasify_finance_live'

DB_PASS_QUOTED = urllib.parse.quote_plus(DB_PASS)
DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{DB_PASS_QUOTED}@{DB_HOST}:{DB_PORT}/{DB_NAME_LIVE}"

async def check_invoice():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        print("Checking invoice 90490 in tbl_salesinvoices_header...")
        res = await conn.execute(text(f"SELECT id, salesinvoicenbr, Salesinvoicesdate, TotalAmount, IsSubmitted, IsAR, customerid FROM {DB_NAME_LIVE}.tbl_salesinvoices_header WHERE salesinvoicenbr = '90490'"))
        invoice = res.fetchone()
        if invoice:
            print(f"Invoice found: {dict(invoice)}")
            
            # Check if it's in DOnumber
            res2 = await conn.execute(text(f"SELECT DISTINCT DOnumber FROM {DB_NAME_LIVE}.tbl_salesinvoices_details WHERE DOnumber = '90490'"))
            do = res2.fetchone()
            if do:
                print(f"Invoice 90490 is found as a DOnumber in tbl_salesinvoices_details!")
            else:
                print(f"Invoice 90490 is NOT found as a DOnumber.")
                
            # Check if it has 'DO ' prefix
            if '90490'.startswith('DO '):
                print("Invoice 90490 starts with 'DO '")
            else:
                print("Invoice 90490 does not start with 'DO '")
                
            # Check balance
            query_balance = text(f"""
                SELECT (h.TotalAmount - 
                    (SELECT COALESCE(SUM(ra3.payment_amount), 0) 
                     FROM {DB_NAME_FINANCE}.tbl_receipt_ag_ar ra3 
                     JOIN {DB_NAME_FINANCE}.tbl_accounts_receivable ar_link3 ON ra3.ar_id = ar_link3.ar_id
                     WHERE TRIM(ar_link3.invoice_no) = TRIM(h.salesinvoicenbr) 
                       AND ra3.is_active = 1
                    ) -
                    (SELECT COALESCE(SUM(cn.Amount), 0) 
                     FROM {DB_NAME_FINANCE}.credit_invoice ci 
                     JOIN {DB_NAME_FINANCE}.Credit_Notes cn ON ci.CreditNoteId = cn.CreditNoteId 
                     WHERE TRIM(ci.InvoiceNo) = TRIM(h.salesinvoicenbr) AND cn.IsSubmitted = 1)
                ) as balance_due
                FROM {DB_NAME_LIVE}.tbl_salesinvoices_header h
                WHERE h.salesinvoicenbr = '90490'
            """)
            res3 = await conn.execute(query_balance)
            balance = res3.fetchone()
            print(f"Calculated Balance: {balance[0] if balance else 'N/A'}")
            
        else:
            print("Invoice 90490 not found in tbl_salesinvoices_header.")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_invoice())
