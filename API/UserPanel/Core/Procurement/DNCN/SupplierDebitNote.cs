using System;

namespace Core.Procurement.DNCN
{
    public class SupplierDebitNote
    {
        public int DebitNoteId { get; set; }
        public string DebitNoteNo { get; set; }
        public string Date { get; set; }
        public decimal DebitAmount { get; set; }
        public string Description { get; set; }
        public int SupplierId { get; set; }
        public string InvoiceNo { get; set; }
        public int CurrencyId { get; set; }
        public bool IsSubmitted { get; set; }
        public int GasCodeId { get; set; }
        public decimal Qty { get; set; }
        public int UomId { get; set; }
    }
}
