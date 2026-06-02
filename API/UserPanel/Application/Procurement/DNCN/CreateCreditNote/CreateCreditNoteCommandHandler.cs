using Core.Procurement.DNCN;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Procurement.DNCN.CreateCreditNote
{
    public class CreateCreditNoteCommandHandler : IRequestHandler<CreateCreditNoteCommand, object>
    {
        private readonly IProcurementDNCNRepository _repository;

        public CreateCreditNoteCommandHandler(IProcurementDNCNRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(CreateCreditNoteCommand request, CancellationToken cancellationToken)
        {
            var note = new SupplierCreditNote
            {
                CreditNoteNo = FormatCreditNoteNo(request.CreditNoteNo),
                Date = request.Date,
                CreditAmount = request.CreditAmount,
                Description = request.Description,
                SupplierId = request.SupplierId,
                InvoiceNo = request.InvoiceNo,
                CurrencyId = request.CurrencyId,
                IsSubmitted = request.IsSubmitted,
                GasCodeId = request.GasCodeId,
                Qty = request.Qty,
                UomId = request.UomId
            };

            return await _repository.CreateCreditNote(note);
        }

        private string FormatCreditNoteNo(string val)
        {
            if (string.IsNullOrWhiteSpace(val)) return val;
            
            string clean = val.Trim();
            if (clean.StartsWith("BTG/CN/", System.StringComparison.OrdinalIgnoreCase))
            {
                clean = clean.Substring(7).Trim();
            }
            
            if (long.TryParse(clean, out long num))
            {
                return $"BTG/CN/{clean.PadLeft(5, '0')}";
            }
            
            return $"BTG/CN/{clean}";
        }
    }
}
