using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Requitision.GetPurchaseRequitisionSeqNo
{
    public class GetPurchaseRequitisionSeqNoQuery : IRequest<object>
    {
        public Int32 BranchId { get; set; }
        public int orgid { get; set; }
    }
}
