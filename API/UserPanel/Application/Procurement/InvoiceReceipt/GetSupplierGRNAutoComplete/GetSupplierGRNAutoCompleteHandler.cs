using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.GetSupplierGRNAutoComplete
{
    public class GetGRNAutoCompleteQueryHandler : IRequestHandler<GetSupplierGRNAutoComplete, object>
    {
        private readonly IInvoiceReceiptRepository _repository;
        public GetGRNAutoCompleteQueryHandler(IInvoiceReceiptRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetSupplierGRNAutoComplete command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetSupplierGRNAutoComplete(command.supplier_id, command.category_id, command.org_id);
            return Result;

        }
    }
}




