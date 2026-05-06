-- ============================================================
-- DEBIT NOTE INTEGRATION - FINAL CONSOLIDATED SCRIPT
-- Database: btggasify_finance_live (MariaDB)
-- Run this entire script in MySQL Workbench at once.
-- It is safe to re-run (idempotent).
-- ============================================================


-- ============================================================
-- SECTION 1: SCHEMA CHANGES
-- ============================================================

-- Add doc_type column to distinguish Invoice vs Debit Note records
ALTER TABLE btggasify_finance_live.tbl_accounts_receivable
    ADD COLUMN IF NOT EXISTS doc_type VARCHAR(10) DEFAULT 'INV' AFTER invoice_no;

-- Add PaidAmount column to Debit_Notes for tracking settlements
ALTER TABLE btggasify_finance_live.Debit_Notes
    ADD COLUMN IF NOT EXISTS PaidAmount DECIMAL(18, 2) DEFAULT 0.00;

-- Initialize all pre-existing AR records as Invoices
UPDATE btggasify_finance_live.tbl_accounts_receivable
SET doc_type = 'INV'
WHERE doc_type IS NULL OR doc_type = '';


-- ============================================================
-- SECTION 2: INDEX CHANGES (MariaDB Virtual Column approach)
-- Allows: INV invoice_no must be unique
--         DN  invoice_no can be non-unique (same DN# for different customers)
-- ============================================================

-- 2a. Drop the old strict unique constraint on invoice_no (if it still exists)
ALTER TABLE btggasify_finance_live.tbl_accounts_receivable
    DROP INDEX IF EXISTS uk_invoice_no;

-- 2b. Add a Virtual Column that is only populated for Invoices (NULL for DNs)
--     Skip if already added from a previous run
ALTER TABLE btggasify_finance_live.tbl_accounts_receivable
    ADD COLUMN IF NOT EXISTS inv_unique_check VARCHAR(100)
    AS (IF(doc_type = 'INV', invoice_no, NULL)) VIRTUAL;

-- 2c. Create Unique Index on that virtual column
--     This enforces uniqueness for INV only, and allows duplicate DN numbers
DROP INDEX IF EXISTS uk_inv_unique_conditional ON btggasify_finance_live.tbl_accounts_receivable;
CREATE UNIQUE INDEX uk_inv_unique_conditional
    ON btggasify_finance_live.tbl_accounts_receivable (inv_unique_check);


-- ============================================================
-- SECTION 3: NEW PROCEDURES
-- ============================================================

-- proc_DN_ApplyPaidAmount
-- Adds to PaidAmount when a receipt is allocated against a Debit Note
DROP PROCEDURE IF EXISTS btggasify_finance_live.proc_DN_ApplyPaidAmount;
DELIMITER //
CREATE PROCEDURE btggasify_finance_live.proc_DN_ApplyPaidAmount(
    IN p_amount DECIMAL(18,2),
    IN p_dn_id  INT
)
BEGIN
    UPDATE btggasify_finance_live.Debit_Notes
    SET PaidAmount = IFNULL(PaidAmount, 0) + p_amount
    WHERE DebitNoteId = p_dn_id;
END //
DELIMITER ;


-- proc_DN_RevertPaidAmount
-- Subtracts from PaidAmount when a receipt allocation is reversed
DROP PROCEDURE IF EXISTS btggasify_finance_live.proc_DN_RevertPaidAmount;
DELIMITER //
CREATE PROCEDURE btggasify_finance_live.proc_DN_RevertPaidAmount(
    IN p_amount DECIMAL(18,2),
    IN p_dn_id  INT
)
BEGIN
    UPDATE btggasify_finance_live.Debit_Notes
    SET PaidAmount = IFNULL(PaidAmount, 0) - p_amount
    WHERE DebitNoteId = p_dn_id;
END //
DELIMITER ;


-- proc_AR_InsertFromDebitNote
-- Syncs a Debit Note into tbl_accounts_receivable when it is submitted.
-- ar_no uses CONCAT(number + id) to satisfy the uk_ar_no unique constraint.
-- Idempotent: checks by invoice_id + doc_type before inserting.
DROP PROCEDURE IF EXISTS btggasify_finance_live.proc_AR_InsertFromDebitNote;
DELIMITER //
CREATE PROCEDURE btggasify_finance_live.proc_AR_InsertFromDebitNote(
    IN p_dn_id     INT,
    IN p_org_id    INT,
    IN p_branch_id INT,
    IN p_user_id   VARCHAR(50)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM btggasify_finance_live.tbl_accounts_receivable
        WHERE invoice_id = p_dn_id AND doc_type = 'DN'
    ) THEN
        INSERT INTO btggasify_finance_live.tbl_accounts_receivable (
            orgid, branchid, ar_no, invoice_no, doc_type, invoice_id, invoice_date,
            customer_id, customer_name, inv_amount, invoice_amt_idr, already_received,
            advance_payment, balance_amount, is_active, is_partial,
            created_by, created_date, currencyid, created_ip
        )
        SELECT
            p_org_id,
            p_branch_id,
            CONCAT('DN-', dn.DebitNoteNumber, '-', dn.DebitNoteId), -- Unique ar_no
            dn.DebitNoteNumber,                                      -- Clean invoice_no
            'DN',
            dn.DebitNoteId,
            dn.TransactionDate,
            dn.CustomerId,
            COALESCE(c.CustomerName, 'Unknown'),
            dn.Amount,  -- inv_amount
            0,          -- invoice_amt_idr
            0,          -- already_received
            0,          -- advance_payment
            dn.Amount,  -- balance_amount
            1,          -- is_active
            0,          -- is_partial
            p_user_id,
            NOW(),
            dn.CurrencyId,
            '127.0.0.1'
        FROM btggasify_finance_live.Debit_Notes dn
        LEFT JOIN btggasify_live.master_customer c ON dn.CustomerId = c.Id
        WHERE dn.DebitNoteId = p_dn_id;
    END IF;
END //
DELIMITER ;


-- ============================================================
-- SECTION 4: UPDATED PROCEDURES
-- ============================================================

-- proc_AR_GetOutstandingInvoices
-- Returns outstanding Invoices AND Debit Notes for a customer.
-- Uses invoice_id (not invoice_no) for DN matching to handle shared DN numbers.
DROP PROCEDURE IF EXISTS btggasify_finance_live.proc_AR_GetOutstandingInvoices;
DELIMITER //
CREATE PROCEDURE btggasify_finance_live.proc_AR_GetOutstandingInvoices(
    IN p_customer_id INT,
    IN p_receipt_id  INT,
    IN p_from_date   DATE,
    IN p_to_date     DATE
)
BEGIN
    -- Normalize p_receipt_id: treat 0 as NULL to avoid incorrect exclusions
    DECLARE v_receipt_id INT DEFAULT NULL;
    IF p_receipt_id > 0 THEN SET v_receipt_id = p_receipt_id; END IF;

    -- ---- INVOICES ----
    SELECT
        h.id                                                    AS invoice_id,
        h.salesinvoicenbr                                       AS invoice_no,
        'INV'                                                   AS record_type,
        (SELECT d.PONumber FROM btggasify_live.tbl_salesinvoices_details d
         WHERE d.salesinvoicesheaderid = h.id LIMIT 1)          AS po_no,
        h.Salesinvoicesdate                                     AS raw_date,
        DATE_FORMAT(h.Salesinvoicesdate, '%d-%m-%Y')            AS invoice_date,
        h.TotalAmount                                           AS total_amount,
        cur.CurrencyCode                                        AS currencycode,

        -- Amount allocated from THIS specific receipt (for pre-filling UI)
        (SELECT COALESCE(SUM(ra.payment_amount), 0)
         FROM btggasify_finance_live.tbl_receipt_ag_ar ra
         JOIN btggasify_finance_live.tbl_accounts_receivable ar_link ON ra.ar_id = ar_link.ar_id
         WHERE ar_link.invoice_id = h.id AND ar_link.doc_type = 'INV'
           AND ra.receipt_id = v_receipt_id AND ra.is_active = 1
        )                                                       AS allocated_here,

        -- Balance Due = Total - all other allocations - credit notes
        (h.TotalAmount
            - (SELECT COALESCE(SUM(ra3.payment_amount), 0)
               FROM btggasify_finance_live.tbl_receipt_ag_ar ra3
               JOIN btggasify_finance_live.tbl_accounts_receivable ar_link3 ON ra3.ar_id = ar_link3.ar_id
               WHERE ar_link3.invoice_id = h.id AND ar_link3.doc_type = 'INV'
                 AND ra3.is_active = 1
                 AND (ra3.receipt_id != v_receipt_id OR v_receipt_id IS NULL)
              )
            - (SELECT COALESCE(SUM(cn.Amount), 0)
               FROM btggasify_finance_live.credit_invoice ci
               JOIN btggasify_finance_live.Credit_Notes cn ON ci.CreditNoteId = cn.CreditNoteId
               WHERE TRIM(ci.InvoiceNo) = TRIM(h.salesinvoicenbr) AND cn.IsSubmitted = 1)
        )                                                       AS balance_due

    FROM btggasify_live.tbl_salesinvoices_header h
    LEFT JOIN btggasify_finance_live.tbl_accounts_receivable ar
           ON TRIM(h.salesinvoicenbr) = TRIM(ar.invoice_no) AND ar.doc_type = 'INV'
    LEFT JOIN btggasify_live.master_currency cur ON ar.currencyid = cur.CurrencyId
    WHERE h.customerid = p_customer_id
      AND (p_from_date IS NULL OR h.Salesinvoicesdate >= p_from_date)
      AND (p_to_date   IS NULL OR h.Salesinvoicesdate <= p_to_date)
      AND h.IsSubmitted = 1
      AND h.IsAR = 1
      AND h.salesinvoicenbr NOT LIKE 'DO %'
      AND h.salesinvoicenbr NOT IN (
          SELECT DISTINCT TRIM(DOnumber)
          FROM btggasify_live.tbl_salesinvoices_details
          WHERE DOnumber IS NOT NULL AND TRIM(DOnumber) != ''
      )
      AND (
          (h.TotalAmount
              - (SELECT COALESCE(SUM(ra4.payment_amount), 0)
                 FROM btggasify_finance_live.tbl_receipt_ag_ar ra4
                 JOIN btggasify_finance_live.tbl_accounts_receivable ar_link4 ON ra4.ar_id = ar_link4.ar_id
                 WHERE ar_link4.invoice_id = h.id AND ar_link4.doc_type = 'INV' AND ra4.is_active = 1
                )
              - (SELECT COALESCE(SUM(cn2.Amount), 0)
                 FROM btggasify_finance_live.credit_invoice ci2
                 JOIN btggasify_finance_live.Credit_Notes cn2 ON ci2.CreditNoteId = cn2.CreditNoteId
                 WHERE TRIM(ci2.InvoiceNo) = TRIM(h.salesinvoicenbr) AND cn2.IsSubmitted = 1)
          ) > 0.01
          OR
          EXISTS (
              SELECT 1 FROM btggasify_finance_live.tbl_receipt_ag_ar ra2
              JOIN btggasify_finance_live.tbl_accounts_receivable ar_link2 ON ra2.ar_id = ar_link2.ar_id
              WHERE ar_link2.invoice_id = h.id AND ar_link2.doc_type = 'INV'
                AND ra2.receipt_id = v_receipt_id AND ra2.is_active = 1
          )
      )

    UNION ALL

    -- ---- DEBIT NOTES (matched by invoice_id, not invoice_no) ----
    SELECT
        dn.DebitNoteId                                          AS invoice_id,
        dn.DebitNoteNumber                                      AS invoice_no,
        'DN'                                                    AS record_type,
        NULL                                                    AS po_no,
        dn.TransactionDate                                      AS raw_date,
        DATE_FORMAT(dn.TransactionDate, '%d-%m-%Y')             AS invoice_date,
        dn.Amount                                               AS total_amount,
        cur.CurrencyCode                                        AS currencycode,

        (SELECT COALESCE(SUM(ra.payment_amount), 0)
         FROM btggasify_finance_live.tbl_receipt_ag_ar ra
         JOIN btggasify_finance_live.tbl_accounts_receivable ar_link ON ra.ar_id = ar_link.ar_id
         WHERE ar_link.invoice_id = dn.DebitNoteId AND ar_link.doc_type = 'DN'
           AND ra.receipt_id = v_receipt_id AND ra.is_active = 1
        )                                                       AS allocated_here,

        (dn.Amount
            - (SELECT COALESCE(SUM(ra3.payment_amount), 0)
               FROM btggasify_finance_live.tbl_receipt_ag_ar ra3
               JOIN btggasify_finance_live.tbl_accounts_receivable ar_link3 ON ra3.ar_id = ar_link3.ar_id
               WHERE ar_link3.invoice_id = dn.DebitNoteId AND ar_link3.doc_type = 'DN'
                 AND ra3.is_active = 1
                 AND (ra3.receipt_id != v_receipt_id OR v_receipt_id IS NULL)
              )
        )                                                       AS balance_due

    FROM btggasify_finance_live.Debit_Notes dn
    LEFT JOIN btggasify_live.master_currency cur ON dn.CurrencyId = cur.CurrencyId
    -- Only show DNs that have been synced to the AR ledger
    INNER JOIN btggasify_finance_live.tbl_accounts_receivable ar_dn
           ON ar_dn.invoice_id = dn.DebitNoteId AND ar_dn.doc_type = 'DN'
    WHERE dn.CustomerId = p_customer_id
      AND dn.IsSubmitted = 1
      AND (p_from_date IS NULL OR dn.TransactionDate >= p_from_date)
      AND (p_to_date   IS NULL OR dn.TransactionDate <= p_to_date)
      AND (
          (dn.Amount
              - (SELECT COALESCE(SUM(ra4.payment_amount), 0)
                 FROM btggasify_finance_live.tbl_receipt_ag_ar ra4
                 JOIN btggasify_finance_live.tbl_accounts_receivable ar_link4 ON ra4.ar_id = ar_link4.ar_id
                 WHERE ar_link4.invoice_id = dn.DebitNoteId AND ar_link4.doc_type = 'DN'
                   AND ra4.is_active = 1
                )
          ) > 0.01
          OR
          EXISTS (
              SELECT 1 FROM btggasify_finance_live.tbl_receipt_ag_ar ra2
              JOIN btggasify_finance_live.tbl_accounts_receivable ar_link2 ON ra2.ar_id = ar_link2.ar_id
              WHERE ar_link2.invoice_id = dn.DebitNoteId AND ar_link2.doc_type = 'DN'
                AND ra2.receipt_id = v_receipt_id AND ra2.is_active = 1
          )
      )

    ORDER BY raw_date ASC;
END //
DELIMITER ;


-- proc_CRUD_GetARIdByInvoiceId
-- Fetches the AR record ID for a given Invoice or Debit Note.
-- Uses invoice_id + doc_type for DNs for accurate matching.
DROP PROCEDURE IF EXISTS btggasify_finance_live.proc_CRUD_GetARIdByInvoiceId;
DELIMITER //
CREATE PROCEDURE btggasify_finance_live.proc_CRUD_GetARIdByInvoiceId(
    IN p_invoice_id INT,
    IN p_type       VARCHAR(10)
)
BEGIN
    IF p_type = 'DN' THEN
        SELECT ar_id FROM btggasify_finance_live.tbl_accounts_receivable
        WHERE invoice_id = p_invoice_id AND doc_type = 'DN'
        LIMIT 1;
    ELSE
        SELECT ar.ar_id
        FROM btggasify_finance_live.tbl_accounts_receivable ar
        JOIN btggasify_live.tbl_salesinvoices_header h
          ON TRIM(ar.invoice_no) = TRIM(h.salesinvoicenbr)
        WHERE h.id = p_invoice_id AND ar.doc_type = 'INV'
        LIMIT 1;
    END IF;
END //
DELIMITER ;


-- ============================================================
-- SECTION 5: DATA UPDATES
-- Mark all Debit Notes as Submitted so they appear in the AR screen
-- ============================================================

UPDATE btggasify_finance_live.Debit_Notes
SET IsSubmitted = 1
WHERE IsSubmitted = 0 OR IsSubmitted IS NULL;


-- ============================================================
-- SECTION 6: ONE-TIME MIGRATION
-- Clean slate approach: remove any partial previous attempts,
-- then re-insert all Debit Notes cleanly.
-- ============================================================

-- 6a. Remove any previously migrated DN entries to avoid conflicts
DELETE FROM btggasify_finance_live.tbl_accounts_receivable WHERE doc_type = 'DN';

-- 6b. Insert all submitted Debit Notes with a unique ar_no
INSERT INTO btggasify_finance_live.tbl_accounts_receivable (
    orgid, branchid, ar_no, invoice_no, doc_type, invoice_id, invoice_date,
    customer_id, customer_name, inv_amount, invoice_amt_idr, already_received,
    advance_payment, balance_amount, is_active, is_partial,
    created_by, created_date, currencyid, created_ip
)
SELECT
    1,
    1,
    CONCAT('DN-', dn.DebitNoteNumber, '-', dn.DebitNoteId), -- Unique ar_no
    dn.DebitNoteNumber,                                      -- Clean original DN number
    'DN',
    dn.DebitNoteId,
    dn.TransactionDate,
    dn.CustomerId,
    COALESCE(c.CustomerName, 'Unknown'),
    dn.Amount,  -- inv_amount
    0,          -- invoice_amt_idr
    0,          -- already_received
    0,          -- advance_payment
    dn.Amount,  -- balance_amount
    1,          -- is_active
    0,          -- is_partial
    'SystemMigration',
    NOW(),
    dn.CurrencyId,
    '127.0.0.1'
FROM btggasify_finance_live.Debit_Notes dn
LEFT JOIN btggasify_live.master_customer c ON dn.CustomerId = c.Id
WHERE dn.IsSubmitted = 1
  AND dn.CustomerId IS NOT NULL; -- Skip DNs with no customer assigned


-- ============================================================
-- SECTION 7: VERIFICATION QUERIES
-- Run these to confirm everything is set up correctly.
-- ============================================================

-- How many of each doc_type is in the AR ledger?
SELECT doc_type, COUNT(*) as total
FROM btggasify_finance_live.tbl_accounts_receivable
GROUP BY doc_type;

-- Check for any DNs that were skipped (missing customer)
SELECT dn.DebitNoteId, dn.DebitNoteNumber, dn.CustomerId
FROM btggasify_finance_live.Debit_Notes dn
WHERE dn.IsSubmitted = 1 AND dn.CustomerId IS NULL;

-- ============================================================
-- END OF SCRIPT
-- ============================================================
