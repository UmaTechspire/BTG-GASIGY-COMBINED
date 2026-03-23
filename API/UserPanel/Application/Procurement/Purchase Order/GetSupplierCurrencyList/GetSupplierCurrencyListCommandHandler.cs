using Application.Procurement.Purchase_Order.GetPurchaseRequisitionList;
using Core.Procurement.PurchaseOrder;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Order.GetSupplierCurrencyList
{
    public class GetSupplierCurrencyListCommandHandler : IRequestHandler<GetSupplierCurrencyListCommand, object>
    {
        private readonly IPurchaseOrderRepository _repository;

        public GetSupplierCurrencyListCommandHandler(IPurchaseOrderRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetSupplierCurrencyListCommand command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetSupplierCurrencyList(command.supplierid, command.branchid, command.orgid);
            return Result;

        }
    }
}
