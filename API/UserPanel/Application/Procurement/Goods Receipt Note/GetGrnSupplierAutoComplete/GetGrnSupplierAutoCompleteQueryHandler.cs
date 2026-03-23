using Application.Procurement.Purchase_Requitision.GetSupplierAutoComplete;
using Core.Procurement.GoodsReceiptNote;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Goods_Receipt_Note.GetGrnSupplierAutoComplete
{
    public class GetGrnSupplierAutoCompleteQueryHandler : IRequestHandler<GetGrnSupplierAutoCompleteQuery, object>
    {
        private readonly IGoodsReceiptNoteRepository _repository;
        public GetGrnSupplierAutoCompleteQueryHandler(IGoodsReceiptNoteRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetGrnSupplierAutoCompleteQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetGrnSupplierAutocomplete(command.branchid, command.orgid, command.suppliername);
            return Result;
        }
    }
}
