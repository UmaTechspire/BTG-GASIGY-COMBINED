using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.GetSupplierPODetailsEditView
{
    public class getSupplierPODetailsEditViewQuery : IRequest<object>
    {
 
        public int po_id { get; set; }
        public int org_id { get; set; }
    }
}
