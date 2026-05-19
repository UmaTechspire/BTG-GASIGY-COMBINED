using Core.Procurement.PurchaseOrder;
using MediatR;

namespace Application.Procurement.Purchase_Order.SaveBlanketPOApprove
{
    public class SaveBlanketPOApproveCommand : IRequest<object>
    {
        public BlanketPOApprovalHdr approve { get; set; }
    }
}
