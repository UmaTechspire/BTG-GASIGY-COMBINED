using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Master.CurrencyItem.UpdateCurrencyItem;
using Core.Master.Currency;
using MediatR;
using static Core.Master.Currency.CurrencyItem;
using UserPanel.Core.Abstractions;
using Core.Abstractions;

namespace Application.OrderMngMaster.Master.CurrencyItem.UpdateCurrencyStatus
{
    public class UpdateCurrencyStatusCommandHandler : IRequestHandler<UpdateCurrencyStatusCommand, object>
    {
        private readonly ICurrencyRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public UpdateCurrencyStatusCommandHandler(ICurrencyRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(UpdateCurrencyStatusCommand command, CancellationToken cancellationToken)
        {
            var currencystatus = new CurrencyItemMain
            {
                Detail = command.Detail,
            };

            var data = await _repository.UpdateCurrencyStatusAsync(currencystatus);
            _unitOfWork.Commit();
            return data;

        }
        #endregion
    }
}

