using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Master.PaymentMethodItem.GetPaymentMethodItemById;
using MediatR;
using UserPanel.Core.Abstractions;
using Core.Master.PaymentMethod;
using static Core.Master.PaymentMethod.PaymentMethodItem;
using Core.Abstractions;

namespace Application.Master.PaymentMethodItem.GetAllPaymentMethodItem
{
    public class GetAllPaymentMethodItemQueryHandler : IRequestHandler<GetAllPaymentMethodItemQuery, object>
    {

        private readonly IPaymentMethodRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public GetAllPaymentMethodItemQueryHandler(IPaymentMethodRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(GetAllPaymentMethodItemQuery query, CancellationToken cancellationToken)
        {
            var paymethods = new PaymentMethodItemMain
            {
                Header = query.Header
            };
            int opt = 1;
            int Id = 0;
            var data = await _repository.GetAllPaymentMethodAsync(opt,Id,query.PayMethodCode);
            _unitOfWork.Commit();
            return data;

        }
        #endregion
    }
}
