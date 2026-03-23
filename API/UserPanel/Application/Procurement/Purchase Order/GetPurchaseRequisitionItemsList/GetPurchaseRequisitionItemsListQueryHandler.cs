using Application.Procurement.Purchase_Requitision.GetPurchaseMemoItemsList;
using Core.Procurement.PurchaseOrder;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Order.GetPurchaseRequisitionItemsList
{
    public class GetPurchaseRequisitionItemsListQueryHandler : IRequestHandler<GetPurchaseRequisitionItemsListQuery , object>
    {
        private readonly IPurchaseOrderRepository _repository;

        public GetPurchaseRequisitionItemsListQueryHandler(IPurchaseOrderRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetPurchaseRequisitionItemsListQuery command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetPurchaseRequisitionItemsList(command.branchid, command.orgid, command.prid);
            return Result;

        }
    }
}
