using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Procurement.PurchaseRequisition;

namespace Application.Procurement.Purchase_Requitision.RequisitionUploadDocument
{
    public class RequisitionUploadDocumentCommand : IRequest<object>
    {
        public List<RequisitionAttachment> attachmentList { get; set; }
    }
}
