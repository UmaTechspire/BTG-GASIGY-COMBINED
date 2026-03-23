using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Procurement.GoodsReceiptNote;
using MediatR;

namespace Application.Procurement.Goods_Receipt_Note.GetAllGoodsReceiptNote
{
    public class GetAllGoodsReceiptNoteQueryHandler : IRequestHandler<GetAllGoodsReceiptNoteQuery , object>
    {
        private readonly IGoodsReceiptNoteRepository _repository;
        
        public GetAllGoodsReceiptNoteQueryHandler(IGoodsReceiptNoteRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetAllGoodsReceiptNoteQuery query, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetAllGRNAsync(query.supplierId, query.grnid, query.OrgId, query.BranchId,query.userid);
            return Result;
        }
    }
}
