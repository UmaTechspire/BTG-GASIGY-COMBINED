using Application.Procurement.Purchase_Requitision.UpdatePurchaseRequitisionItem;
using Core.Abstractions;
using Core.Procurement.PurchaseOrder;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Order.UpdatePurchaseOrderItem
{
    public class UpdatePurchaseOrderItemQueryHandler : IRequestHandler<UpdatePurchaseOrderItemQuery , object>
    {
        private readonly IPurchaseOrderRepository _repository;

        private readonly IUnitOfWorkDB2 _unitOfWork;



        public UpdatePurchaseOrderItemQueryHandler(IPurchaseOrderRepository repository, IUnitOfWorkDB2 unitOfWork)
        {

            _repository = repository;
            _unitOfWork = unitOfWork;

        }
        public async Task<object> Handle(UpdatePurchaseOrderItemQuery command, CancellationToken cancellationToken)
        {
            PurchaseOrder Items = new PurchaseOrder();
            Items.Header = command.Header;
            Items.Details = command.Details;
            Items.Requisition = command.Requisition;

            var data = await _repository.UpdateAsync(Items);
            _unitOfWork.Commit();

            return data;


        }
    }
}
