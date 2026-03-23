using Application.Procurement.Purchase_Order.GetPurchaseOrderSeqNo;
using Core.Procurement.GoodsReceiptNote;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Goods_Receipt_Note.GetGoodsReceiptNoteSeqNo
{
    public class GetGoodsReceiptNoteSeqNoQueryHandler : IRequestHandler<GetGoodsReceiptNoteSeqNoQuery, object>
    {
        private readonly IGoodsReceiptNoteRepository _repository;
        public GetGoodsReceiptNoteSeqNoQueryHandler(IGoodsReceiptNoteRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetGoodsReceiptNoteSeqNoQuery command, CancellationToken cancellationToken)
        {

            return command.Opt switch 
            { 
                1 => await _repository.GetPOListAsync(command.supplierid?? 0, command.branchid, command.orgid, command.grnid),
                2 => await _repository.GetPOSupplierListAsync(command.branchid, command.orgid,command.grnid),
                3 => await _repository.GetByGRNNoSeqAsync(command.branchid, command.orgid),
                4 => await _repository.GetPoItemList(command.poid, command.orgid, command.branchid,command.grnid),
            };          
                
            
        }
    }
}
