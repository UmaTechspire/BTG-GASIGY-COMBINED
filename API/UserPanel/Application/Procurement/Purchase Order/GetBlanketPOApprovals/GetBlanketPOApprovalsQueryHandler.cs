using Core.Procurement.PurchaseOrder;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Order.GetBlanketPOApprovals
{
    public class GetBlanketPOApprovalsQueryHandler : IRequestHandler<GetBlanketPOApprovalsQuery, object>
    {
        private readonly IPurchaseOrderRepository _repository;

        public GetBlanketPOApprovalsQueryHandler(IPurchaseOrderRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetBlanketPOApprovalsQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetBlanketPOApprovalsAsync(request.branchid, request.orgid, request.userid);
        }
    }
}
