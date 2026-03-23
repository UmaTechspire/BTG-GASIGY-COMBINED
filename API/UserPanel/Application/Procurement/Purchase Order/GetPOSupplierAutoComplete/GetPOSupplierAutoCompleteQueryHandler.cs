using Application.Procurement.Purchase_Requitision.GetSupplierAutoComplete;
using Core.Procurement.PurchaseOrder;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Order.GetPOSupplierAutoComplete
{
    public class GetPOSupplierAutoCompleteQueryHandler : IRequestHandler<GetPOSupplierAutoCompleteQuery , object>
    {
        private readonly IPurchaseOrderRepository _repository;

        public GetPOSupplierAutoCompleteQueryHandler(IPurchaseOrderRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetPOSupplierAutoCompleteQuery command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetPOSupplierAutoComplete(command.branchid, command.orgid, command.suppliername);
            return Result;

        }
    }
}
