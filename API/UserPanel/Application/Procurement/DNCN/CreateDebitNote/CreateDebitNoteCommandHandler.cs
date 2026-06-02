using Core.Procurement.DNCN;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Procurement.DNCN.CreateDebitNote
{
    public class CreateDebitNoteCommandHandler : IRequestHandler<CreateDebitNoteCommand, object>
    {
        private readonly IProcurementDNCNRepository _repository;

        public CreateDebitNoteCommandHandler(IProcurementDNCNRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(CreateDebitNoteCommand request, CancellationToken cancellationToken)
        {
            var note = new SupplierDebitNote
            {
                DebitNoteNo = FormatDebitNoteNo(request.DebitNoteNo),
                Date = request.Date,
                DebitAmount = request.DebitAmount,
                Description = request.Description,
                SupplierId = request.SupplierId,
                InvoiceNo = request.InvoiceNo,
                CurrencyId = request.CurrencyId,
                IsSubmitted = request.IsSubmitted,
                GasCodeId = request.GasCodeId,
                Qty = request.Qty,
                UomId = request.UomId
            };

            return await _repository.CreateDebitNote(note);
        }

        private string FormatDebitNoteNo(string val)
        {
            if (string.IsNullOrWhiteSpace(val)) return val;
            
            string clean = val.Trim();
            if (clean.StartsWith("BTG/DN/", System.StringComparison.OrdinalIgnoreCase))
            {
                clean = clean.Substring(7).Trim();
            }
            
            if (long.TryParse(clean, out long num))
            {
                return $"BTG/DN/{clean.PadLeft(4, '0')}";
            }
            
            return $"BTG/DN/{clean}";
        }
    }
}
