using Application.Procurement.Master.Supplier.GetAllState;
using Core.Master.Supplier;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Supplier.GetAllSupplierCategory
{
    public class GetAllSupplierCategoryCommandHandler : IRequestHandler<GetAllSupplierCategoryCommand ,object>
    {
        private readonly ISupplierMasterRepository _repository;

        public GetAllSupplierCategoryCommandHandler(ISupplierMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllSupplierCategoryCommand request, CancellationToken cancellationToken)
        {
            return await _repository.GetSupplierCategoryList(request.branchid, request.orgid);
        }
    }
}
