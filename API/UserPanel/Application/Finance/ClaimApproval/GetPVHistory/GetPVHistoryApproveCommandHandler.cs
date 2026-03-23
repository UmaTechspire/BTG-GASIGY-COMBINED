 
using Application.Finance.ClaimApproval.GetPVHistory;
using Core.Finance.Approval;
  
using MediatR; 

namespace Application.Finance.ClaimAndPayment.GetHistory
{
    public class GetPVHistoryApproveCommandHandler : IRequestHandler<GetPVHistoryApproveCommand, object>
    {
        private readonly IClaimApprovalRepository _repository;


        public GetPVHistoryApproveCommandHandler(IClaimApprovalRepository repository)
        {

            _repository = repository;

        }
        public async Task<object> Handle(GetPVHistoryApproveCommand command, CancellationToken cancellationToken)
        {

            var Result = await _repository.Getcommenthistory(command.id);
            return Result;

        }
    }
}

