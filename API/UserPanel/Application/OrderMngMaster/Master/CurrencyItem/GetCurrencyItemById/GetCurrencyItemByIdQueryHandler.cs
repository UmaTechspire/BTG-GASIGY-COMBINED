using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Master.CurrencyItem.CreateCurrencyItem;
using Core.Master.Currency;
using MediatR;
using static Core.Master.Currency.CurrencyItem;
using UserPanel.Core.Abstractions;
using static System.Runtime.InteropServices.JavaScript.JSType;
using Core.Abstractions;

namespace Application.Master.CurrencyItem.GetCurrencyItemById
{
    public class GetCurrencyItemByIdQueryHandler: IRequestHandler<GetCurrencyItemByIdQuery, object>
    {
        private readonly ICurrencyRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public GetCurrencyItemByIdQueryHandler(ICurrencyRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(GetCurrencyItemByIdQuery query, CancellationToken cancellationToken)
        {
            var currencyItems = new CurrencyItemMain
            {
                Header = query.Header
            };
            int opt = 2;
            int Id = 0;
            string Code = "";
            string Name = "";

            if (query.Id >0) {

                 var data = await _repository.GetCurrencyByIdAsync(opt,query.Id,Code,Name);
                _unitOfWork.Commit();
                return data ?? new { };
            }
            else if (query.CurCode != null)
            {
                opt = 3;
                 var data = await _repository.GetCurrencyByCodeAsync(opt,Id,query.CurCode,Name);
                _unitOfWork.Commit();
                return data?? new { };
            }
            else if (query.CurName != null)
            {
                opt = 4;
                var data = await _repository.GetCurrencyByNameAsync(opt,Id,Code,query.CurName);
                _unitOfWork.Commit();
                return data?? new { };
            }

            return new { message ="Invalid Id Or Code Or Name!" };

        }
        #endregion
    }
}
