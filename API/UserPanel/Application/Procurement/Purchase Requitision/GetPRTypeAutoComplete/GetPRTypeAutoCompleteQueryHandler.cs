using Application.Procurement.Purchase_Requitision.GetSupplierAutoComplete;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Requitision.GetPRTypeAutoComplete
{
    internal class GetPRTypeAutoCompleteQueryHandler : IRequestHandler<GetPRTypeAutoCompleteQuery, object>
    {
        private readonly IPurchaseRequisitionRepository _repository;

        public GetPRTypeAutoCompleteQueryHandler(IPurchaseRequisitionRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetPRTypeAutoCompleteQuery command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetPRTypeAutoComplete(command.branchid, command.orgid, command.prtype);
            return Result;

        }
    }
}