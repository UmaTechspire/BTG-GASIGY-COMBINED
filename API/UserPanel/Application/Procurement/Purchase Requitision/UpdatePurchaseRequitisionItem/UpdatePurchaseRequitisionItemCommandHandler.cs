using Application.Procurement.Purchase_Memo.UpdatePurchaseMemoItem;
using Core.Abstractions;
using Core.Procurement.PurchaseMemo;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Requitision.UpdatePurchaseRequitisionItem
{
    public class UpdatePurchaseRequitisionItemCommandHandler : IRequestHandler<UpdatePurchaseRequitisionItemCommand, object>
    {
        private readonly IPurchaseRequisitionRepository _repository;

        private readonly IUnitOfWorkDB2 _unitOfWork;



        public UpdatePurchaseRequitisionItemCommandHandler(IPurchaseRequisitionRepository repository, IUnitOfWorkDB2 unitOfWork)
        {

            _repository = repository;
            _unitOfWork = unitOfWork;

        }
        public async Task<object> Handle(UpdatePurchaseRequitisionItemCommand command, CancellationToken cancellationToken)
        {
            PurchaseRequisition Items = new PurchaseRequisition();
            Items.Header = command.Header;
            Items.Details = command.Details;

            var data = await _repository.UpdateAsync(Items);
            _unitOfWork.Commit();

            return data;


        }
    }
}
