using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using UserPanel.Core.Abstractions;
using Core.Master.Department;
using static Core.Master.Department.DepartmentItem;
using Application.Master.CurrencyItem.CreateCurrencyItem;
using static Core.Master.Currency.CurrencyItem;
using Core.Abstractions;

namespace Application.Master.DepartmentItem.CreateDepartmentItem
{
    public class CreateDepartmentItemCommandHandler : IRequestHandler<CreateDepartmentItemCommand, object>
    {
        private readonly IDepartmentRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public CreateDepartmentItemCommandHandler(IDepartmentRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(CreateDepartmentItemCommand command, CancellationToken cancellationToken)
        {
            var departmentitem = new DepartmentItemMain
            {
                Header = command.Header
            };

            var data = await _repository.CreateDepartmentAsync(departmentitem);
            _unitOfWork.Commit();
            return data;

        }
        #endregion












    }
}
