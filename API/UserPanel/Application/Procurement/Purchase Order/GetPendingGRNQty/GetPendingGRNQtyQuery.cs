using MediatR;

namespace Application.Procurement.Purchase_Order.GetPendingGRNQty
{
    public class GetPendingGRNQtyQuery : IRequest<object>
    {
        public int poid { get; set; }
    }
}
