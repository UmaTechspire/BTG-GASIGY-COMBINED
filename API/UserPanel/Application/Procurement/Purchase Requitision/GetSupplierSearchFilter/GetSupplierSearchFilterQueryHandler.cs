using Application.Procurement.Purchase_Requitision.GetSupplierAutoComplete;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Requitision.GetSupplierSearchFilter
{
        public class GetSupplierSearchFilterQueryHandler : IRequestHandler<GetSupplierSearchFilterQuery, object>
        {
            private readonly IPurchaseRequisitionRepository _repository;

            public GetSupplierSearchFilterQueryHandler(IPurchaseRequisitionRepository repository)
            {
                _repository = repository;
            }

            public async Task<object> Handle(GetSupplierSearchFilterQuery command, CancellationToken cancellationToken)
            {

                var Result = await _repository.GetSupplierSearchFilter(command.branchid, command.orgid, command.suppliername);
                return Result;

            }
        }
}
