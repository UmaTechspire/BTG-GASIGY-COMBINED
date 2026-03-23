using Application.Finance.Common;
using Application.Procurement.Master.Common;
using Core.Abstractions;
using Core.Finance.Master;
using Core.Models;
using MediatR;

namespace Application.Finance.Common
{
    public class CreateCommonClaimAndPaymentCommandHandler : IRequestHandler<CreateCommonClaimAndPaymentCommand, object>
    {
        private readonly IClaimAndPaymentCommonMasterRepository _repository;
        private readonly IFinaceDBConnection _financedb;

        public CreateCommonClaimAndPaymentCommandHandler(IClaimAndPaymentCommonMasterRepository repository, IFinaceDBConnection unitOfWork)
        {
            _repository = repository;
            _financedb = unitOfWork;

        }

        public async Task<object> Handle(CreateCommonClaimAndPaymentCommand command, CancellationToken cancellationToken)
        {
            if (command.opt == 1)
            {
                var Result = await _repository.GetCategoryDetails(command.Id, command.branchid, command.searchtext, command.orgid);
                return Result;
            }
            if (command.opt == 2)
            {
                var Result = await _repository.GetDepartMentDetails(command.Id, command.branchid, command.searchtext, command.orgid);
                return Result;
            }
            if (command.opt == 3)
            {
                var Result = await _repository.GetApplicantDetails(command.Id, command.branchid, command.searchtext, command.orgid);
                return Result;
            }
            if (command.opt == 4)
            {
                var Result = await _repository.GetTransactionCurrency(command.Id, command.branchid, command.searchtext, command.orgid);
                return Result;
            }
            if (command.opt == 5)
            {
                var Result = await _repository.GetClaimType(command.Id, command.branchid, command.searchtext, command.orgid, command.categoryid);
                return Result;
            }
            if (command.opt == 6)
            {
                var Result = await _repository.GetPaymentDescription(command.Id, command.branchid, command.searchtext,command.orgid,command.claimtype_id);
                return Result;
            }
            if (command.opt == 7)
            {
                var Result = await _repository.GetSupplierList(command.Id, command.branchid, command.searchtext, command.orgid, command.claimtype_id);
                return Result;
            }
            if (command.opt == 8)
            {
                var Result = await _repository.GetAllClaimList(command.Id, command.branchid, command.searchtext, command.orgid, command.claimtype_id);
                return Result;
            }
            if (command.opt == 9)
            {
                var Result = await _repository.GetPOList(command.Id, command.branchid, command.searchtext, command.orgid, command.supplierid);
                return Result;
            }
            if (command.opt == 10)
            {
                var Result = await _repository.GetPaymentdetails(command.searchtext, command.orgid);
                return Result;
            }
            else
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "No record found",
                    Status = false
                };
            }

        }
    }
}
