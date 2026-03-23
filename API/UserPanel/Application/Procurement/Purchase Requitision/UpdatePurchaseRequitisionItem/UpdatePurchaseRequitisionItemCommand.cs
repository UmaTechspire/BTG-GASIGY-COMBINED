using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Requitision.UpdatePurchaseRequitisionItem
{
    public class UpdatePurchaseRequitisionItemCommand : IRequest<object>
    {

        public PurchaseRequisitionHeader Header {get; set;}
   
        public List<PurchaseRequisitionDetail> Details { get; set; }

    }
}
