using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Master.PaymentMethodItem.GetAllPaymentMethodItem;
using MediatR;
using UserPanel.Core.Abstractions;
using Core.Master.PaymentMethod;
using static Core.Master.PaymentMethod.PaymentMethodItem;
using Core.Abstractions;

namespace Application.Master.PaymentMethodItem.CreatePaymentMethodItem
{
    public class CreatePaymentMethodItemCommandHandler : IRequestHandler<CreatePaymentMethodItemCommand, object>
    {

        private readonly IPaymentMethodRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public CreatePaymentMethodItemCommandHandler(IPaymentMethodRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(CreatePaymentMethodItemCommand command, CancellationToken cancellationToken)
        {
            var paymethods = new PaymentMethodItemMain
            {
                Header = command.Header
            };
            
            var data = await _repository.CreatePaymentMethodAsync(paymethods);
            _unitOfWork.Commit();
            return data;

        }
        #endregion
    }
}
