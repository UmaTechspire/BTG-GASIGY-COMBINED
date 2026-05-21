using Core.Procurement.PurchaseOrder;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Order.SaveBlanketPOApprove
{
    public class SaveBlanketPOApproveCommandHandler : IRequestHandler<SaveBlanketPOApproveCommand, object>
    {
        private readonly IPurchaseOrderRepository _repository;

        public SaveBlanketPOApproveCommandHandler(IPurchaseOrderRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(SaveBlanketPOApproveCommand request, CancellationToken cancellationToken)
        {
            return await _repository.SaveBlanketPOApproveAsync(request.approve);
        }
    }
}
