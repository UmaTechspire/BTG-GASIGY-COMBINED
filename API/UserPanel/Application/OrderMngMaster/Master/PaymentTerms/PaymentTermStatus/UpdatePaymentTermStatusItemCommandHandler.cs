using Application.Master.PaymentTerms.UpdatePaymentTermStatusItem;
using Core.Abstractions;
using Core.Master.PaymentTerms;
using MediatR;
using UserPanel.Core.Abstractions;
using static Core.Master.PaymentTerms.PaymentTermItem;

namespace Application.Master.PaymentTerms.UpdatePaymentTermItem
{
    public class UpdatePaymentTermStatusItemCommandHandler : IRequestHandler<UpdatePaymentTermStatusItemCommand, object>
    {
        private readonly IPaymentTermRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public UpdatePaymentTermStatusItemCommandHandler(IPaymentTermRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        #region Handle
        public async Task<object> Handle(UpdatePaymentTermStatusItemCommand command, CancellationToken cancellationToken)
        {
            var payTerms = new PaymentTermMain
            {
                Header = command.Header
            };

            var data = await _repository.UpdatePaymentTermAsync(payTerms);
            return data;
        }
        #endregion

    }
}
