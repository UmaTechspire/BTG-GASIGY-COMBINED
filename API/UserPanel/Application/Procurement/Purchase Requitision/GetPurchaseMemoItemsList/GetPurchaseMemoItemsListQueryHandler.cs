using Application.Procurement.Purchase_Requitision.GetPurchaseMemoList;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using MediatR.Pipeline;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Requitision.GetPurchaseMemoItemsList
{
    public class GetPurchaseMemoItemsListQueryHandler : IRequestHandler<GetPurchaseMemoItemsListQuery , object>
    {
        private readonly IPurchaseRequisitionRepository _repository;

        public GetPurchaseMemoItemsListQueryHandler(IPurchaseRequisitionRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetPurchaseMemoItemsListQuery command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetMemoItemsList(command.branchid, command.orgid,command.memoid);
            return Result;

        }
    }
}
