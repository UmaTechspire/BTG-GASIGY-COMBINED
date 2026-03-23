using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Abstractions;
using Core.Master.Department;
using MediatR;
using UserPanel.Core.Abstractions;
using static Core.Master.Department.DepartmentItem;


namespace Application.Master.DepartmentItem.UpdateDepartmentItem
{
    public class UpdateDepartmentItemCommandHandler : IRequestHandler<UpdateDepartmentItemCommand, object>
    {
        private readonly IDepartmentRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;
        public UpdateDepartmentItemCommandHandler(IDepartmentRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(UpdateDepartmentItemCommand command, CancellationToken cancellationToken)
        {
            var departmentitem = new DepartmentItemMain
            {
                Header = command.Header
            };

            var data = await _repository.UpdateDepartmentAsync(departmentitem);
            _unitOfWork.Commit();
            return data;
        }
        #endregion


    }
}
