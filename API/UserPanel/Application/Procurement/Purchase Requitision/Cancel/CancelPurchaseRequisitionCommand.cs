using MediatR;

namespace Application.Procurement.Purchase_Requitision.Cancel
{
    public class CancelPurchaseRequisitionCommand : IRequest<object>
    {
        public int prid { get; set; }
        public int userId { get; set; }
        public int branchId { get; set; }
        public int orgId { get; set; }
    }
}
