using Core.Procurement.PurchaseOrder;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Order.GetAllPurchaseOrderItems
{
    public class GetAllPurchaseOrderItemsQueryHandler : IRequestHandler<GetAllPurchaseOrderItemsQuery, object>
    {
        private readonly IPurchaseOrderRepository _repository;

        public GetAllPurchaseOrderItemsQueryHandler(IPurchaseOrderRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllPurchaseOrderItemsQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetAllAsync(command.requestorid, command.branchid, command.supplierid, command.orgid, command.poid,command.userid);
            return Result;
        }

    }
}
