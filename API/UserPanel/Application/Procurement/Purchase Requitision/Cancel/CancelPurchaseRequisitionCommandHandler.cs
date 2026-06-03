using Core.Procurement.PurchaseRequisition;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Requitision.Cancel
{
    public class CancelPurchaseRequisitionCommandHandler : IRequestHandler<CancelPurchaseRequisitionCommand, object>
    {
        private readonly IPurchaseRequisitionRepository _repository;

        public CancelPurchaseRequisitionCommandHandler(IPurchaseRequisitionRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(CancelPurchaseRequisitionCommand command, CancellationToken cancellationToken)
        {
            return await _repository.CancelPRAsync(command.prid, command.userId, command.branchId, command.orgId);
        }
    }
}
