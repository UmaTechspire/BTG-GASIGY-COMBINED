using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.Goods_Receipt_Note.CreateGoodsReceiptNote;
using Core.Abstractions;
using Core.Procurement.GoodsReceiptNote;
using MediatR;

namespace Application.Procurement.Goods_Receipt_Note.UpdateGoodsReceiptNote
{
    public class UpdateGoodsReceiptNoteQueryHandler : IRequestHandler<UpdateGoodsReceiptNoteQuery, object>
    {
        private readonly IGoodsReceiptNoteRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;
        public UpdateGoodsReceiptNoteQueryHandler(IGoodsReceiptNoteRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<object> Handle(UpdateGoodsReceiptNoteQuery command, CancellationToken cancellationToken)
        {
            GoodsReceiptNote Items = new GoodsReceiptNote();
            Items.Header = command.Header;
            Items.Details = command.Details;


            var data = await _repository.UpdateAsync(Items);
            _unitOfWork.Commit();
            return data;


        }
    }
}

