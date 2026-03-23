using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Permissions;
using System.Text;
using System.Threading.Tasks;
using Core.Abstractions;
using Core.Master.Department;
using MediatR;
using UserPanel.Core.Abstractions;
using static System.Runtime.InteropServices.JavaScript.JSType;
using static Core.Master.Department.DepartmentItem;

namespace Application.Master.DepartmentItem.GetDepartmentItemById
{
    public class GetDepartmentItemByIdQueryHandler : IRequestHandler<GetDepartmentItemByIdQuery, object>
    {
        private readonly IDepartmentRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public GetDepartmentItemByIdQueryHandler (IDepartmentRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(GetDepartmentItemByIdQuery query, CancellationToken cancellationToken)
        {
            var departmentitem = new DepartmentItemMain
            { 
            Header = query.Header
            };

            int opt = 0;
            int Id = 0;
            string DeptCode = "";
            string DeptName = "";

            if (query.Id > 0)
            {
                opt = 2;
               var data = await _repository.GetDepartmentByIdAsync(opt,query.Id,DeptCode,DeptName);
                _unitOfWork.Commit();
                return data?? new { };
            }
            else if(query.DepartmentCode != null)
            {
                opt = 3;
                 var data = await _repository.GetDepartmentByCodeAsync(opt, Id, query.DepartmentCode, DeptName);
                _unitOfWork.Commit();
                return data?? new { };
            }
            else if (query.DepartmentName != null)
            {
                opt = 4;
                var data = await _repository.GetDepartmentByNameAsync(opt, Id, DeptCode, query.DepartmentName);
                _unitOfWork.Commit();
                return data?? new { };
            }
            return new { message = "Invalid Id Or Name Or Code!!" };
            
        }
        #endregion







    }
}
