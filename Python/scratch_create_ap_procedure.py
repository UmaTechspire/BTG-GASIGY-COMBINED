import asyncio
import os
from sqlalchemy import text
from app.database import engine

async def main():
    db_finance = os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live')
    db_purchase = os.getenv('DB_NAME_PURCHASE', 'btggasify_purchase_live')
    
    sql = f"""
    DROP PROCEDURE IF EXISTS {db_finance}.proc_AP_AccountsPayableLedger;
    CREATE PROCEDURE {db_finance}.proc_AP_AccountsPayableLedger (
        IN p_supplier_id INT,
        IN p_currency_id INT,
        IN p_from_date DATE,
        IN p_to_date DATE
    )
    BEGIN
        SELECT 
            po.pono AS po_no,
            DATE(po.podate) AS po_date,
            po.nettotal AS po_amount,
            gh.grnno AS grn_no,
            DATE(gh.grndate) AS grn_date,
            CASE 
                WHEN clm.ApplicationNo IS NOT NULL THEN clm.ApplicationNo
                WHEN irn.docno IS NOT NULL THEN irn.docno
                ELSE '-'
            END AS ref_no,
            DATE(
                CASE 
                    WHEN clm.ApplicationNo IS NOT NULL THEN clm.CreatedDate
                    WHEN irn.docdate IS NOT NULL THEN irn.docdate
                    ELSE gh.grndate
                END
            ) AS ref_date,
            IFNULL(irn.po_amount, 0) AS irn_amount,
            IFNULL(cmd.TotalAmount, 0) AS claim_amount
        FROM {db_purchase}.tbl_grn_header gh
        INNER JOIN {db_purchase}.tbl_grn_detail gd ON gd.grnid = gh.grnid
        INNER JOIN {db_purchase}.tbl_purchaseorder_header po ON po.poid = gd.poid
        LEFT JOIN {db_purchase}.tbl_IRNReceipt_detail irn ON CAST(irn.grn_id AS UNSIGNED) = gh.grnid
        LEFT JOIN {db_finance}.tbl_claimAndpayment_header clm ON clm.irnid = irn.receiptnote_hdr_id
        LEFT JOIN {db_finance}.tbl_claimAndpayment_Details cmd ON cmd.Claim_ID = clm.Claim_ID AND cmd.poid = po.poid AND cmd.IsActive = 1
        WHERE po.isactive = 1
          AND (p_supplier_id = 0 OR po.supplierid = p_supplier_id)
          AND (p_currency_id = 0 OR po.currencyid = p_currency_id)
          AND (p_from_date IS NULL OR DATE(po.podate) >= p_from_date)
          AND (p_to_date IS NULL OR DATE(po.podate) <= p_to_date)
        GROUP BY po.poid, gh.grnid, irn.receiptnote_hdr_id, clm.Claim_ID;
    END;
    """
    
    try:
        async with engine.connect() as conn:
            # Drop and create in separate executions if needed, but semicolon usually works if driver allows
            # SQLAlchemy might not like multiple statements in one text(). I'll split them.
            statements = [
                f"DROP PROCEDURE IF EXISTS {db_finance}.proc_AP_AccountsPayableLedger",
                f"""
                CREATE PROCEDURE {db_finance}.proc_AP_AccountsPayableLedger (
                    IN p_supplier_id INT,
                    IN p_currency_id INT,
                    IN p_from_date DATE,
                    IN p_to_date DATE
                )
                BEGIN
                    SELECT 
                        po.poid AS poid,
                        po.pono AS po_no,
                        DATE(po.podate) AS po_date,
                        po.nettotal AS po_amount,
                        gh.grnid AS grnid,
                        gh.grnno AS grn_no,
                        DATE(gh.grndate) AS grn_date,
                        idtl.receiptnote_hdr_id AS irn_id,
                        idtl.docno AS irn_no,
                        DATE(idtl.docdate) AS irn_date,
                        clm.ApplicationNo AS claim_no,
                        DATE(clm.CreatedDate) AS claim_date,
                        clm.Claim_ID AS claim_id,
                        clm.voucherno AS voucher_no,
                        clm.IsVoucherGenerate AS is_paid,
                        (
                            SELECT IFNULL(SUM(idat.po_amount), 0)
                            FROM {db_purchase}.tbl_IRNReceipt_detail idat
                            WHERE CAST(idat.grn_id AS UNSIGNED) = gh.grnid 
                              AND idat.poid = po.poid
                              AND (idtl.receiptnote_hdr_id IS NULL OR idat.receiptnote_hdr_id = idtl.receiptnote_hdr_id)
                        ) AS irn_amount,
                        (
                            SELECT IFNULL(SUM(cdat.TotalAmount), 0)
                            FROM {db_finance}.tbl_claimAndpayment_Details cdat
                            WHERE cdat.Claim_ID = clm.Claim_ID 
                              AND cdat.poid = po.poid 
                              AND cdat.IsActive = 1
                        ) AS claim_amount,
                        clm.ClaimAmountInTC AS claim_header_amount
                    FROM {db_purchase}.tbl_grn_header gh
                    INNER JOIN (SELECT DISTINCT grnid, poid FROM {db_purchase}.tbl_grn_detail) gd ON gd.grnid = gh.grnid
                    INNER JOIN {db_purchase}.tbl_purchaseorder_header po ON po.poid = gd.poid
                    LEFT JOIN {db_purchase}.tbl_IRNReceipt_detail idtl ON CAST(idtl.grn_id AS UNSIGNED) = gh.grnid AND idtl.poid = po.poid
                    LEFT JOIN {db_finance}.tbl_claimAndpayment_header clm ON clm.irnid = idtl.receiptnote_hdr_id
                    WHERE po.isactive = 1
                      AND (p_supplier_id = 0 OR po.supplierid = p_supplier_id)
                      AND (p_currency_id = 0 OR po.currencyid = p_currency_id)
                      AND (p_from_date IS NULL OR DATE(po.podate) >= p_from_date)
                      AND (p_to_date IS NULL OR DATE(po.podate) <= p_to_date)
                    GROUP BY po.poid, gh.grnid, idtl.receiptnote_hdr_id, clm.Claim_ID;
                END
                """
            ]
            for stmt in statements:
                await conn.execute(text(stmt))
            await conn.commit()
            print("Procedure proc_AP_AccountsPayableLedger created successfully.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
