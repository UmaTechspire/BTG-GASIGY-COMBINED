using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Master.PaymentMethodItem.UpdatePaymentMethodItem;
using MediatR;
using UserPanel.Core.Abstractions;
using Core.Master.PaymentMethod;
using static Core.Master.PaymentMethod.PaymentMethodItem;
using Core.Abstractions;

namespace Application.Master.PaymentMethodItem.GetPaymentMethodItemById
{
    public class GetPaymentMethodItemByIdQueryHandler : IRequestHandler<GetPaymentMethodItemByIdQuery, object>
    {

        private readonly IPaymentMethodRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public GetPaymentMethodItemByIdQueryHandler(IPaymentMethodRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(GetPaymentMethodItemByIdQuery query, CancellationToken cancellationToken)
        {
            var paymethods = new PaymentMethodItemMain
            {
                Header = query.Header
            };
            int opt = 0;

            if (query.Id > 0)
            {
                opt = 2;
                string payMCode = "";

                var data = await _repository.GetPaymentMethodByIdAsync(opt,query.Id, payMCode);
                _unitOfWork.Commit();
                return data ?? new { };
                
            }
            else if(query.PayMethodCode != null)
            {
                opt = 3;
                int Id = 0;
               var data = await _repository.GetPaymentMethodByCodeAsync(opt, Id, query.PayMethodCode);
                _unitOfWork.Commit();
                return data?? new { };
            }
            return new { message = "Invalid query.ProviderId or SearchCode!" };
            

        }
        #endregion
    }
}

