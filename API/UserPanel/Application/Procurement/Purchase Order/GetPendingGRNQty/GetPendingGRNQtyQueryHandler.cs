using Core.Procurement.PurchaseOrder;
using MediatR;

namespace Application.Procurement.Purchase_Order.GetPendingGRNQty
{
    public class GetPendingGRNQtyQueryHandler : IRequestHandler<GetPendingGRNQtyQuery, object>
    {
        private readonly IPurchaseOrderRepository _repository;

        public GetPendingGRNQtyQueryHandler(IPurchaseOrderRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetPendingGRNQtyQuery query, CancellationToken cancellationToken)
        {
            var result = await _repository.GetPendingGRNQtyAsync(query.poid);
            return result;
        }
    }
}
