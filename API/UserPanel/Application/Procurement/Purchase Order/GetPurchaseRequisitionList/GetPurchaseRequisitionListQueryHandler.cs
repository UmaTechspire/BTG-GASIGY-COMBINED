using Application.Procurement.Purchase_Requitision.GetPurchaseMemoList;
using Core.Procurement.PurchaseOrder;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Order.GetPurchaseRequisitionList
{
    public class GetPurchaseRequisitionListQueryHandler : IRequestHandler<GetPurchaseRequisitionListQuery , object>
    {
        private readonly IPurchaseOrderRepository _repository;

        public GetPurchaseRequisitionListQueryHandler(IPurchaseOrderRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetPurchaseRequisitionListQuery command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetPurchaseRequositionList(command.supplierid,command.branchid, command.orgid, command.currencyid);
            return Result;

        }
    }
}
