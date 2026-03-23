using Application.Procurement.Purchase_Requitision.GetRequestorAutoComplete;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Requitision.GetSupplierAutoComplete
{
    public class GetSupplierAutoCompleteQueryHandler : IRequestHandler<GetSupplierAutoCompleteQuery ,object>
    {
        private readonly IPurchaseRequisitionRepository _repository;

        public GetSupplierAutoCompleteQueryHandler(IPurchaseRequisitionRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetSupplierAutoCompleteQuery command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetSupplierAutoComplete(command.branchid, command.orgid, command.suppliername);
            return Result;

        }
    }
}
