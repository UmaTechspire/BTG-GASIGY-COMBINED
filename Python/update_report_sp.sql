DROP PROCEDURE IF EXISTS btggasify_finance_live.proc_Bank_GetReportTransactions;
DELIMITER //
CREATE PROCEDURE btggasify_finance_live.proc_Bank_GetReportTransactions(
    IN p_from_date DATE, IN p_to_date DATE, IN p_bank_id INT
)
BEGIN
    SELECT 
        COALESCE(r.receipt_date, r.created_date) as Date,
        CONCAT(r.receipt_id, ' - ', COALESCE(r.reference_no, '')) as VoucherNo,
        CASE 
            WHEN r.transaction_type != 'Receipt' THEN r.transaction_type
            WHEN MAX(r.bank_payment_via) = 1 THEN 'Cheque'
            WHEN MAX(r.bank_payment_via) = 4 THEN 'Cash'
            WHEN MAX(COALESCE(NULLIF(r.bank_amount, 0), r.cash_amount)) < 0 THEN 'Payment' 
            ELSE 'Receipt' 
        END as TransactionType,
        MAX(b.BankName) as Account,
        CASE 
            WHEN LOWER(r.transaction_type) = 'bank interest' THEN 'Bank Interest'
            WHEN LOWER(r.transaction_type) = 'bank transfer' THEN 'Bank Transfer'
            WHEN LOWER(r.transaction_type) = 'cash deposit' THEN 'Cash Deposit'
            WHEN MAX(r.cash_amount) < 0 AND MAX(r.bank_amount) = 0 THEN 'Petty Cash / Cash Holding'
            WHEN MAX(COALESCE(NULLIF(r.bank_amount, 0), r.cash_amount)) < 0 AND MAX(r.customer_id) != 0 
                THEN COALESCE(MAX(s.SupplierName), 'Unknown Supplier')
            WHEN MAX(r.customer_id) = 0 AND r.reference_no LIKE 'CLM%' 
                THEN SUBSTRING_INDEX(r.reference_no, ' - ', -1)
            WHEN MAX(COALESCE(NULLIF(r.bank_amount, 0), r.cash_amount)) < 0 AND MAX(r.customer_id) = 0 
                THEN 'Bank Charges'
            ELSE COALESCE(MAX(c.CustomerName), 'Unknown Customer') 
        END as Party,
        CASE 
            WHEN LOWER(r.transaction_type) = 'bank transfer' THEN 
                CASE 
                    WHEN r.deposit_bank_id = p_bank_id THEN COALESCE(rb.BankName, 'Unknown Bank (Receiver)')
                    ELSE COALESCE(sb.BankName, 'Unknown Bank (Sender)')
                END
            WHEN LOWER(r.transaction_type) = 'bank charges' 
                 OR (MAX(COALESCE(NULLIF(r.bank_amount, 0), r.cash_amount)) < 0 AND MAX(r.customer_id) = 0)
                 OR (MAX(r.customer_id) = 0 AND r.reference_no LIKE 'CLM%')
                THEN r.reference_no
            ELSE NULL
        END as PartyDetail,
        CASE 
            WHEN IFNULL(r.is_submitted, 0) = 1 THEN
                COALESCE(NULLIF(r.reference_no, ''), (
                    SELECT GROUP_CONCAT(ar_inner.invoice_no SEPARATOR ', ')
                    FROM btggasify_finance_live.tbl_receipt_ag_ar ra_inner
                    JOIN btggasify_finance_live.tbl_accounts_receivable ar_inner ON ra_inner.ar_id = ar_inner.ar_id
                    WHERE ra_inner.receipt_id = r.receipt_id AND ra_inner.is_active = 1
                ), '')
            ELSE r.reference_no
        END as Description,
        COALESCE(MAX(mc.CurrencyCode), 'IDR') as Currency, 
        CASE 
            WHEN r.transaction_type = 'Bank transfer' THEN
                CASE WHEN r.customer_id = p_bank_id THEN ABS(MAX(COALESCE(NULLIF(r.bank_amount, 0), r.cash_amount))) ELSE 0 END
            WHEN MAX(COALESCE(NULLIF(r.bank_amount, 0), r.cash_amount)) >= 0 
                THEN MAX(COALESCE(NULLIF(r.bank_amount, 0), r.cash_amount)) 
            ELSE 0 
        END as DebitOut,
        CASE 
            WHEN r.transaction_type = 'Bank transfer' THEN
                CASE WHEN r.deposit_bank_id = p_bank_id THEN ABS(MAX(COALESCE(NULLIF(r.bank_amount, 0), r.cash_amount))) ELSE 0 END
            WHEN MAX(COALESCE(NULLIF(r.bank_amount, 0), r.cash_amount)) < 0 
                THEN ABS(MAX(COALESCE(NULLIF(r.bank_amount, 0), r.cash_amount))) 
            ELSE 0 
        END as CreditIn,
        CASE 
            WHEN r.transaction_type = 'Bank transfer' THEN
                CASE 
                    WHEN r.customer_id = p_bank_id THEN ABS(MAX(COALESCE(NULLIF(r.bank_amount, 0), r.cash_amount))) 
                    ELSE -ABS(MAX(COALESCE(NULLIF(r.bank_amount, 0), r.cash_amount))) 
                END
            ELSE MAX(COALESCE(NULLIF(r.bank_amount, 0), r.cash_amount))
        END as NetAmount,
        MAX(r.bank_payment_via) as bank_payment_via,
        MAX(r.cheque_number) as cheque_number,
        MAX(r.cash_amount) as cash_amount,
        CASE WHEN IFNULL(r.is_submitted, 0) = 1 THEN (
            SELECT GROUP_CONCAT(ar_inner.invoice_no SEPARATOR ', ')
            FROM btggasify_finance_live.tbl_receipt_ag_ar ra_inner
            JOIN btggasify_finance_live.tbl_accounts_receivable ar_inner ON ra_inner.ar_id = ar_inner.ar_id
            WHERE ra_inner.receipt_id = r.receipt_id AND ra_inner.is_active = 1
        ) ELSE NULL END as AllocatedInvoices,
        r.receipt_id
    FROM btggasify_finance_live.tbl_ar_receipt r
    LEFT JOIN btggasify_live.master_customer c ON r.customer_id = c.Id
    LEFT JOIN btggasify_masterpanel_live.master_supplier s ON r.customer_id = s.SupplierId
    LEFT JOIN btggasify_masterpanel_live.master_bank b ON CAST(NULLIF(r.deposit_bank_id, '') AS UNSIGNED) = b.BankId
    LEFT JOIN btggasify_masterpanel_live.master_bank sb ON CAST(NULLIF(r.deposit_bank_id, '') AS UNSIGNED) = sb.BankId 
    LEFT JOIN btggasify_masterpanel_live.master_bank rb ON CAST(NULLIF(r.customer_id, '') AS UNSIGNED) = rb.BankId 
    LEFT JOIN btggasify_live.master_currency mc ON COALESCE(r.currencyid, b.CurrencyId) = mc.CurrencyId
    WHERE 
        DATE(COALESCE(r.receipt_date, r.created_date)) BETWEEN p_from_date AND p_to_date
        AND r.is_active = 1
        AND IFNULL(r.is_posted, 0) = 1
        AND (
            CAST(NULLIF(r.deposit_bank_id, '') AS UNSIGNED) = p_bank_id 
            OR (r.transaction_type = 'Bank transfer' AND r.customer_id = p_bank_id)
        )
    GROUP BY 
        r.receipt_id,
        r.reference_no,
        COALESCE(r.receipt_date, r.created_date),
        r.transaction_type,
        r.deposit_bank_id,
        r.customer_id
    ORDER BY COALESCE(r.receipt_date, r.created_date) ASC, r.receipt_id ASC;
END //
DELIMITER ;
