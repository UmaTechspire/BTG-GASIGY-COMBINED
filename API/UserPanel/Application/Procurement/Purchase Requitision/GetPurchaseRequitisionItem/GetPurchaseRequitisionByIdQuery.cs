using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Application.Procurement.Purchase_Requitision.GetPurchaseRequitisionItem
{
    public class GetPurchaseRequitisionByIdQuery : IRequest<object>
    {
        public Int32 Id { get; set; }
        public Int32 branchid { get; set; }
        public Int32 orgid { get; set; }
    }
}
