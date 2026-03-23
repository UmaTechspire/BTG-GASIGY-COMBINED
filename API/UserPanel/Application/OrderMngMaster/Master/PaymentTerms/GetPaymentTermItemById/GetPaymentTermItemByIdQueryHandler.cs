using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Master.PaymentTerms.GetAllPaymentTermItem;
using Core.Master.PaymentTerms;
using MediatR;
using static Core.Master.PaymentTerms.PaymentTermItem;
using UserPanel.Core.Abstractions;
using Core.Abstractions;

namespace Application.Master.PaymentTerms.GetPaymentTermItemById
{
    public class GetPaymentTermItemByIdQueryHandler : IRequestHandler<GetPaymentTermItemByIdQuery, object>
    {

        private readonly IPaymentTermRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public GetPaymentTermItemByIdQueryHandler(IPaymentTermRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(GetPaymentTermItemByIdQuery query, CancellationToken cancellationToken)
        {
            var payTerms = new PaymentTermMain 
                { 
                 Header = query.Header
                };
            int opt=0;
            if (query.Id >0)
            {
                opt = 2;
                string payTcode = "";
                var data = await _repository.GetPaymentTermByIdAsync(opt,query.Id,payTcode);
                _unitOfWork.Commit();
                return data ?? new { };
            }
            else if (query.SearchCode != null)
            {
                opt = 3;
                int payTid = 0;
                var data = await _repository.GetPaymentTermByCodeAsync(opt, payTid,query.SearchCode);
                _unitOfWork.Commit();
                return data?? new { };
            }

            return new { message = "Invalid query.ProviderId Or SearchCode!" };    

        }
        #endregion
    }


}
