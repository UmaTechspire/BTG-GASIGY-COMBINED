using MediatR;

namespace Application.Procurement.DNCN.UpdateCreditNote
{
    public class UpdateCreditNoteCommand : IRequest<object>
    {
        public int CreditNoteId { get; set; }
        public string CreditNoteNo { get; set; }
        public string Date { get; set; }
        public decimal CreditAmount { get; set; }
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
