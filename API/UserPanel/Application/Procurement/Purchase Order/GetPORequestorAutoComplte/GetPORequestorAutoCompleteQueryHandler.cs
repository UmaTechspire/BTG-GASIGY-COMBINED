using Application.Procurement.Purchase_Requitision.GetRequestorAutoComplete;
using Core.Procurement.PurchaseOrder;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Order.GetPORequestorAutoComplte
{
    public class GetPORequestorAutoCompleteQueryHandler : IRequestHandler<GetPORequestorAutoCompleteQuery, object>
    {
        private readonly IPurchaseOrderRepository _repository;

        public GetPORequestorAutoCompleteQueryHandler(IPurchaseOrderRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetPORequestorAutoCompleteQuery command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetPORequstorAutoComplete(command.branchid, command.orgid, command.requestorname);
            return Result;

        }
    }
}
