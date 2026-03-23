using MediatR;
using static Core.Master.PaymentTerms.PaymentTermItem;

namespace Application.Master.PaymentTerms.UpdatePaymentTermStatusItem
{
    public class UpdatePaymentTermStatusItemCommand : IRequest<object>
    {
        public PaymentTermHeader Header { get; set; }
        public int PayTermId { get; set; }
    }
}
