using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Order.GetPurchaseRequisitionItemsList
{
    public class GetPurchaseRequisitionItemsListQuery : IRequest<object>
    {
        public int branchid { get; set; }
        public int orgid { get; set; }
        public int prid { get; set; }
    }
}
