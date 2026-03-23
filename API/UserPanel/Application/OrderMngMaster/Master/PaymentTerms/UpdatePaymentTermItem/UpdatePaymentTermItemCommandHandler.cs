using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Master.PaymentTerms.CreatePaymentTermItem;
using Core.Master.PaymentTerms;
using MediatR;
using static Core.Master.PaymentTerms.PaymentTermItem;
using UserPanel.Core.Abstractions;
using Core.Abstractions;

namespace Application.Master.PaymentTerms.UpdatePaymentTermItem
{
    public class UpdatePaymentTermItemCommandHandler : IRequestHandler<UpdatePaymentTermItemCommand, object>
    {

        private readonly IPaymentTermRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public UpdatePaymentTermItemCommandHandler(IPaymentTermRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        #region Handle
        public async Task<object> Handle(UpdatePaymentTermItemCommand command, CancellationToken cancellationToken)
        {
            var payTerms = new PaymentTermMain
            {
                Header = command.Header
            };

            var data = await _repository.UpdatePaymentTermAsync(payTerms);
            _unitOfWork.Commit();
            return data;

        }
        #endregion
    }


}
