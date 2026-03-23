using Core.Abstractions;
using Core.Master.PaymentMethod;
using MediatR;
using UserPanel.Core.Abstractions;
using static Core.Master.PaymentMethod.PaymentMethodItem;

namespace Application.Master.PaymentMethodItem.UpdatePaymentMethodItem
{
    public class UpdatePaymentMethodItemCommandHandler : IRequestHandler<UpdatePaymentMethodItemCommand, object>
    {
        private readonly IPaymentMethodRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public UpdatePaymentMethodItemCommandHandler(IPaymentMethodRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(UpdatePaymentMethodItemCommand command, CancellationToken cancellationToken)
        {
            var paymethods = new PaymentMethodItemMain
            {
                Header = command.Header
            };

            var data = await _repository.UpdatePaymentMethodAsync(paymethods);
            _unitOfWork.Commit();
            return data;

        }
        #endregion
    }
}
