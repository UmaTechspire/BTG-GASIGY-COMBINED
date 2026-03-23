using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Abstractions;
using Core.Procurement.PurchaseRequisition;
using MediatR;



namespace Application.Procurement.Purchase_Requitision.CreatePurchaseRequitisionItem
{
    public class CreatePurchaseRequitisionCommandHandler : IRequestHandler<CreatePurchaseRequitionCommand, object>
    {
        private readonly IPurchaseRequisitionRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;


        public CreatePurchaseRequitisionCommandHandler(IPurchaseRequisitionRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<object> Handle(CreatePurchaseRequitionCommand command, CancellationToken cancellationToken)
        {
            PurchaseRequisition Items = new PurchaseRequisition();
            Items.Header = command.Header;
            Items.Details = command.Details;

            var data = await _repository.AddAsync(Items);
            _unitOfWork.Commit();
            return data;


        }
    }
}
