using MediatR;

namespace Application.Procurement.Purchase_Order.GetBlanketPOApprovals
{
    public class GetBlanketPOApprovalsQuery : IRequest<object>
    {
        public int branchid { get; set; }
        public int orgid { get; set; }
        public int userid { get; set; }
    }
}
