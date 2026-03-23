using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.Purchase_Requitision.GetPurchaseRequitisionItem;
using Core.Procurement.GoodsReceiptNote;
using Core.Procurement.PurchaseRequisition;
using MediatR;

namespace Application.Procurement.Goods_Receipt_Note.GetGoodsReceiptNoteById
{
    public class GetGoodsReceiptNoteByIdQueryHandler : IRequestHandler<GetGoodsReceiptNoteByIdQuery, object>
    {
        private readonly IGoodsReceiptNoteRepository _repository;

        public GetGoodsReceiptNoteByIdQueryHandler(IGoodsReceiptNoteRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetGoodsReceiptNoteByIdQuery query, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetGoodsReceiptNoteByIdAsync(query.Id, query.branchid, query.orgid);
            return Result;

        }
    }
}
