using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.Purchase_Requitision.GetAllPurchaseRequitsionitems
{
    public class GetAllPurchaseRequisitionQuery : IRequest<object>
    {
        public int requesterid { get; set; }
        public Int32 BranchId { get; set; }
        public Int32 SupplierId { get; set; }
        public Int32 orgid { get; set; }

        public Int32 PRTypeid { get; set; }
        public  int userid { get; set; }

    }
}
