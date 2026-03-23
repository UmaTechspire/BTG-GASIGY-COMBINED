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

namespace Application.Master.PaymentTerms.GetAllPaymentTermItem
{
    public class GetAllPaymentTermItemQueryHandler : IRequestHandler<GetAllPaymentTermItemQuery, object>
    {

        private readonly IPaymentTermRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public GetAllPaymentTermItemQueryHandler(IPaymentTermRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(GetAllPaymentTermItemQuery query, CancellationToken cancellationToken)
        {
            PaymentTermMain payTerms = new PaymentTermMain();
            payTerms.Header = query.Header;
            int opt = 1;
            int payTermId = 0;

            var data = await _repository.GetAllPaymentTermAsync(opt, payTermId, query.PayTermCode);
            _unitOfWork.Commit();
            return data;

        }
        #endregion
    }
}
