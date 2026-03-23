using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Procurement.PurchaseRequisition;
using MediatR;

namespace Application.Procurement.Purchase_Requitision.CreatePurchaseRequitisionItem
{
    public class CreatePurchaseRequitionCommand : IRequest<object>
    {
        public PurchaseRequisitionHeader Header { get; set; }
        public List<PurchaseRequisitionDetail> Details { get; set; }

    }
}
