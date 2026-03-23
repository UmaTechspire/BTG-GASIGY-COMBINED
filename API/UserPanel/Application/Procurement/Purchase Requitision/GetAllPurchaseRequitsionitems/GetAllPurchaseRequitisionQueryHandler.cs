using Application.Procurement.Purchase_Memo.GetAllPurchaseMemoItems;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Application.Procurement.Purchase_Requitision.GetAllPurchaseRequitsionitems
{
    public class GetAllPurchaseRequitisionQueryHandler : IRequestHandler<GetAllPurchaseRequisitionQuery , Object>
    {
        private readonly IPurchaseRequisitionRepository _repository;

        public GetAllPurchaseRequitisionQueryHandler(IPurchaseRequisitionRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllPurchaseRequisitionQuery command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetAllAsync(command.requesterid, command.BranchId , command.SupplierId, command.orgid, command.PRTypeid,command.userid);
            return Result;

        }
    }
}
