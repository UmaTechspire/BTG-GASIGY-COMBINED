using Application.Procurement.Purchase_Memo.GetPurchaseMemoSeqNo;
using Core.Procurement.PurchaseMemo;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Requitision.GetPurchaseRequitisionSeqNo
{
    public class GetPurchaseRequitisionSeqNoQueryHandler : IRequestHandler<GetPurchaseRequitisionSeqNoQuery , object>
    {
        private readonly IPurchaseRequisitionRepository _repository;
        public GetPurchaseRequitisionSeqNoQueryHandler(IPurchaseRequisitionRepository repository)
        {
            _repository = repository;

        }
        public async Task<object> Handle(GetPurchaseRequitisionSeqNoQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetBySeqNoAsync(command.BranchId,command.orgid);
            return Result;

        }
    }
}
