using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.GetSupplierPODetailsEditView
{
    public class getSupplierPODetailsEditViewHandler : IRequestHandler<getSupplierPODetailsEditViewQuery, object>
    {
        private readonly IInvoiceReceiptRepository _repository;
        public getSupplierPODetailsEditViewHandler(IInvoiceReceiptRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(getSupplierPODetailsEditViewQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.getSupplierPODetailsEditView(command.po_id, command.org_id);
            return Result;
        }
    }
}
