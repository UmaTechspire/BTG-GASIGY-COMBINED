using Application.Finance.ClaimApproval.GetHistory;
using Core.Finance.Approval;
using Core.Procurement.Approval;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.RequisitionApproval.GetHistory
{
    public  class GetHistoryRequisitionApproveCommandHandler : IRequestHandler<GetHistoryRequisitionApproveCommand, object>
    {
        private readonly IRequisitionApprovalRepository _repository;


        public GetHistoryRequisitionApproveCommandHandler(IRequisitionApprovalRepository repository)
        {

            _repository = repository;

        }
        public async Task<object> Handle(GetHistoryRequisitionApproveCommand command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetHistoryAsync(command.id, command.userid, command.BranchId, command.OrgId, command.fromdate, command.todate);
            return Result;

        }
    }
}
