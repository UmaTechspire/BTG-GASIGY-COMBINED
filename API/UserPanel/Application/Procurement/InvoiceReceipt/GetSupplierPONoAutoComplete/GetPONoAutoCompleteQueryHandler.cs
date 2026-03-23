using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.InvoiceReceipt.GetSupplierPONoAutoComplete;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.GetSupplierPONoAutoComplete
{
    public class GetPONoAutoCompleteQueryHandler : IRequestHandler<GetSupplierPONoAutoComplete, object>
    {
        private readonly IInvoiceReceiptRepository _repository;
        public GetPONoAutoCompleteQueryHandler(IInvoiceReceiptRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetSupplierPONoAutoComplete command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetPONoAutoComplete(command.supplier_id, command.category_id, command.org_id);
            return Result;
        }
    }
}
