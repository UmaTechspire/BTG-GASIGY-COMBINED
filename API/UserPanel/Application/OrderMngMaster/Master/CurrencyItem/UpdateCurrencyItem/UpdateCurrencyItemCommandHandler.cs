using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Master.CountryItem.CreateCountryItem;
using Core.Abstractions;
using Core.Master.Country;
using Core.Master.Currency;
using MediatR;
using UserPanel.Core.Abstractions;
using static Core.Master.Currency.CurrencyItem;

namespace Application.Master.CurrencyItem.UpdateCurrencyItem
{
    public class UpdateCurrencyItemCommandHandler : IRequestHandler<UpdateCurrencyItemCommand, object>
    {
        private readonly ICurrencyRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public UpdateCurrencyItemCommandHandler(ICurrencyRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(UpdateCurrencyItemCommand command, CancellationToken cancellationToken)
        {
            var currencyItems = new CurrencyItemMain
            {
                Header = command.Header
            };

            var data = await _repository.UpdateCurrencyAsync(currencyItems);
            _unitOfWork.Commit();
            return data;

        }
        #endregion
    }
}
