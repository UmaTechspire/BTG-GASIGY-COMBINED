using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Goods_Receipt_Note.GetGrnSupplierAutoComplete
{
    public class GetGrnSupplierAutoCompleteQuery : IRequest<object>
    {
        public int branchid { get; set; }
        public int orgid { get; set; }
        public string suppliername { get; set; }
    }
}
