using Core.Procurement.DNCN;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Procurement.DNCN.GetItemsByInvoiceId
{
    public class GetItemsByInvoiceIdQueryHandler : IRequestHandler<GetItemsByInvoiceIdQuery, object>
    {
        private readonly IProcurementDNCNRepository _repository;

        public GetItemsByInvoiceIdQueryHandler(IProcurementDNCNRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetItemsByInvoiceIdQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetItemsByInvoiceId(request.InvoiceId);
        }
    }
}
