using Application.Procurement.Purchase_Memo.GetPurchaseMemoItem;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Requitision.GetPurchaseRequitisionItem
{
    public class GetPurchaseRequitisionByIdQueryHandler : IRequestHandler<GetPurchaseRequitisionByIdQuery , object>
    {
        private readonly IPurchaseRequisitionRepository _repository;

        public GetPurchaseRequitisionByIdQueryHandler(IPurchaseRequisitionRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetPurchaseRequitisionByIdQuery query, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetByIdAsync(query.Id, query.branchid,query.orgid);
            return Result;

        }
    }
}
