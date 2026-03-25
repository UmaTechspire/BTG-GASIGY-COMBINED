import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def deploy_proc():
    sql = """
DROP PROCEDURE IF EXISTS btggasify_finance_live.proc_AR_GetOutstandingInvoices;
CREATE PROCEDURE btggasify_finance_live.proc_AR_GetOutstandingInvoices(
    IN p_customer_id INT,
    IN p_receipt_id INT,
    IN p_from_date DATE,
    IN p_to_date DATE
)
BEGIN
    SELECT 
        h.id as invoice_id,
        h.salesinvoicenbr as invoice_no,
        (SELECT d.PONumber FROM btggasify_live.tbl_salesinvoices_details d 
         WHERE d.salesinvoicesheaderid = h.id LIMIT 1) as po_no,
        DATE_FORMAT(h.Salesinvoicesdate, '%d-%m-%Y') as invoice_date,
        h.TotalAmount as total_amount,
        cur.CurrencyCode as currencycode,
        (SELECT COALESCE(SUM(ra.payment_amount), 0) 
         FROM btggasify_finance_live.tbl_receipt_ag_ar ra 
         JOIN btggasify_finance_live.tbl_accounts_receivable ar_link ON ra.ar_id = ar_link.ar_id
         WHERE TRIM(ar_link.invoice_no) = TRIM(h.salesinvoicenbr) 
           AND ra.receipt_id = p_receipt_id AND ra.is_active = 1
        ) as allocated_here,
        (h.TotalAmount - (IFNULL(h.PaidAmount, 0) - 
            (SELECT COALESCE(SUM(ra.payment_amount), 0) 
             FROM btggasify_finance_live.tbl_receipt_ag_ar ra 
             JOIN btggasify_finance_live.tbl_accounts_receivable ar_link ON ra.ar_id = ar_link.ar_id
             WHERE TRIM(ar_link.invoice_no) = TRIM(h.salesinvoicenbr) 
               AND ra.receipt_id = p_receipt_id AND ra.is_active = 1
            )
        )) as balance_due
    FROM btggasify_live.tbl_salesinvoices_header h
    LEFT JOIN btggasify_finance_live.tbl_accounts_receivable ar ON TRIM(h.salesinvoicenbr) = TRIM(ar.invoice_no)
    LEFT JOIN btggasify_live.master_currency cur ON ar.currencyid = cur.CurrencyId
    WHERE h.customerid = p_customer_id
      AND (p_from_date IS NULL OR h.Salesinvoicesdate >= p_from_date)
      AND (p_to_date IS NULL OR h.Salesinvoicesdate <= p_to_date)
      AND h.IsSubmitted = 1
      AND h.IsAR = 1
      AND (
          (h.TotalAmount - IFNULL(h.PaidAmount, 0)) > 0
          OR 
          EXISTS (
              SELECT 1 FROM btggasify_finance_live.tbl_receipt_ag_ar ra2
              JOIN btggasify_finance_live.tbl_accounts_receivable ar_link2 ON ra2.ar_id = ar_link2.ar_id
              WHERE TRIM(ar_link2.invoice_no) = TRIM(h.salesinvoicenbr)
                AND ra2.receipt_id = p_receipt_id AND ra2.is_active = 1
          )
      )
      AND h.salesinvoicenbr NOT IN (
          SELECT DISTINCT DOnumber 
          FROM btggasify_live.tbl_salesinvoices_details 
          WHERE DOnumber IS NOT NULL AND DOnumber != ''
      )
      AND h.salesinvoicenbr NOT LIKE 'DO %'
    ORDER BY h.Salesinvoicesdate ASC;
END;
    """
    try:
        conn = pymysql.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=int(os.getenv('DB_PORT', 3306)),
            client_flag=pymysql.constants.CLIENT.MULTI_STATEMENTS
        )
        with conn.cursor() as cur:
            cur.execute(sql)
            conn.commit()
            print("Successfully deployed proc_AR_GetOutstandingInvoices!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    deploy_proc()
