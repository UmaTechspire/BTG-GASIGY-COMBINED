using Core.Procurement.PurchaseOrder;
using MediatR;

namespace Application.Procurement.Purchase_Order.ShortClosurePurchaseOrder
{
    public class ShortClosurePurchaseOrderCommandHandler : IRequestHandler<ShortClosurePurchaseOrderCommand, object>
    {
        private readonly IPurchaseOrderRepository _repository;

        public ShortClosurePurchaseOrderCommandHandler(IPurchaseOrderRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(ShortClosurePurchaseOrderCommand command, CancellationToken cancellationToken)
        {
            var result = await _repository.ShortClosureAsync(command.poid, command.userId, command.branchId, command.orgId);
            return result;
        }
    }
}
