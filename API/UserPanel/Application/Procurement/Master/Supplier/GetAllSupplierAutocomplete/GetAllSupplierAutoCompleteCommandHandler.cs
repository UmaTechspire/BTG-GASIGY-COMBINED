using Application.Procurement.Master.Supplier.GetAllState;
using Core.Master.Supplier;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Supplier.GetAllSupplierAutocomplete
{
    public class GetAllSupplierAutoCompleteCommandHandler : IRequestHandler<GetAllSupplierAutoCompleteCommand,object>
    {
        private readonly ISupplierMasterRepository _repository;

        public GetAllSupplierAutoCompleteCommandHandler(ISupplierMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllSupplierAutoCompleteCommand request, CancellationToken cancellationToken)
        {
            return await _repository.GetSupplierList(request.branchid, request.orgid);
        }

    }
}
