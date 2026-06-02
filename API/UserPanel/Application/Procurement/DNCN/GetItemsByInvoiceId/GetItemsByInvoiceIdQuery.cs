using MediatR;

namespace Application.Procurement.DNCN.GetItemsByInvoiceId
{
    public class GetItemsByInvoiceIdQuery : IRequest<object>
    {
        public int InvoiceId { get; set; }
    }
}
