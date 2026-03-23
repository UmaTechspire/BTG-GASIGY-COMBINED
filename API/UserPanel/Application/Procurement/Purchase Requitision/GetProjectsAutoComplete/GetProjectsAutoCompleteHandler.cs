using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Requitision.GetProjectsAutoComplete
{
    public class GetProjectsAutoCompleteHandler : IRequestHandler<GetProjectsAutocompleteQuery, object>
    {
        private readonly IPurchaseRequisitionRepository _repository;

        public GetProjectsAutoCompleteHandler(IPurchaseRequisitionRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetProjectsAutocompleteQuery command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetProjectsAutoComplete(command.branchid, command.orgid, command.projects);
            return Result;

        }
    }

}
