using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using static Core.Master.PaymentTerms.PaymentTermItem;

namespace Application.Master.PaymentTerms.UpdatePaymentTermItem
{
    public class UpdatePaymentTermItemCommand : IRequest<object>
    {
        public PaymentTermHeader Header { get; set; }
        public int PayTermId { get; set; }
    }
}
