using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Master.DepartmentItem.GetAllDepartmentItem;
using Application.Master.DepartmentItem.GetAllDepartmentITem;
using Core.Abstractions;
using Core.Master.Department;
using MediatR;
using UserPanel.Core.Abstractions;
using static Core.Master.Department.DepartmentItem;

namespace Application.Master.DepartmentItem.GetAllDepartmentItem
{
    public class GetAllDepartmentItemQueryHandler: IRequestHandler<GetAllDepartmentItemQuery, object>
    {
        private readonly IDepartmentRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;
     
        public GetAllDepartmentItemQueryHandler(IDepartmentRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(GetAllDepartmentItemQuery query, CancellationToken cancellationToken)
        {
            var departmentitem = new DepartmentItemMain
            {
                Header = query.Header
            };
            int opt = 1;
            int Id = 0;
            var data = await _repository.GetAllDepartmentAsync(opt, Id,query.DepartCode , query.DepartName);
            _unitOfWork.Commit();
            return data;
        }

        #endregion










    }
}
