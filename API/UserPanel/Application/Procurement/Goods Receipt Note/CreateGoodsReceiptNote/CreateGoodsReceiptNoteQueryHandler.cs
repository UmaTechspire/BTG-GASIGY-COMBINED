using Application.Procurement.Purchase_Order.CreatePurchaseOrderItem;
using Core.Abstractions;
using Core.Procurement.GoodsReceiptNote;
using Core.Procurement.PurchaseOrder;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Goods_Receipt_Note.CreateGoodsReceiptNote
{
    public class CreateGoodsReceiptNoteQueryHandler : IRequestHandler<CreateGoodsReceiptNoteQuery , object>
    {
        private readonly IGoodsReceiptNoteRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;
        public CreateGoodsReceiptNoteQueryHandler(IGoodsReceiptNoteRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<object> Handle(CreateGoodsReceiptNoteQuery command, CancellationToken cancellationToken)
        {
            GoodsReceiptNote Items = new GoodsReceiptNote();
            Items.Header = command.Header;
            Items.Details = command.Details;
            

            var data = await _repository.AddAsync(Items);
            _unitOfWork.Commit();
            return data;


        }
    }
}
