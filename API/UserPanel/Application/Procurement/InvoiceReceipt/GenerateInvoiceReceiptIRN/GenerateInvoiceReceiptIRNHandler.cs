using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.InvoiceReceipt.GenerateInvoiceReceipt;
using Core.Abstractions;
using Core.Procurement.InvoiceReceipt;
using MediatR;
using UserPanel.Core.Abstractions;

namespace Application.Procurement.InvoiceReceipt.GenerateInvoiceReceiptIRN
{
    public class GenerateInvoiceReceiptIRNHandler : IRequestHandler<GenerateInvoiceReceiptIRNQuery, object>
    {
        private readonly IInvoiceReceiptRepository _repository;        
        public GenerateInvoiceReceiptIRNHandler(IInvoiceReceiptRepository repository, IUnitOfWorkDB2 unitOfWork)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GenerateInvoiceReceiptIRNQuery command, CancellationToken cancellationToken)
        {
            InvoiceEntry1 Items = new InvoiceEntry1();
            Items.item = command.item;

            var data = await _repository.GenerateInvoiceReceiptIRN(Items);
            return data;
        }
    }
}

