using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Order.GetPurchaseRequisitionList
{
    public class GetPurchaseRequisitionListQuery : IRequest<object>
    {
        public int supplierid { get; set; }
        public int branchid { get; set; }
        public int orgid { get; set; }

        public int currencyid { get; set; }
    }
}
