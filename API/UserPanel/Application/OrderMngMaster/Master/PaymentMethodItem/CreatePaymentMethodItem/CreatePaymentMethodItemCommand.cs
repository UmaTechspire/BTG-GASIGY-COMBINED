using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using static Core.Master.PaymentMethod.PaymentMethodItem;

namespace Application.Master.PaymentMethodItem.CreatePaymentMethodItem
{
    public class CreatePaymentMethodItemCommand : IRequest<object>
    {
        public PaymentMethodItemHeader Header { get; set; }

    }
}
