using Application.Procurement.Purchase_Requitision.GetAllPurchaseRequitsionitems;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Requitision.GetRequestorAutoComplete
{
    public class GetRequestorAutoCompleteQueryHandler : IRequestHandler<GetRequestorAutoComplteQuery , object>
    {
        private readonly IPurchaseRequisitionRepository _repository;

        public GetRequestorAutoCompleteQueryHandler(IPurchaseRequisitionRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetRequestorAutoComplteQuery command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetRequstorAutoComplete(command.branchid, command.orgid, command.requestorname);
            return Result;

        }
    }
}
