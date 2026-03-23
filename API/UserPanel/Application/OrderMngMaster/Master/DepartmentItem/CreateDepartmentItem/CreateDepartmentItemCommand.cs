using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using static Core.Master.Department.DepartmentItem;

namespace Application.Master.DepartmentItem.CreateDepartmentItem
{
    public class CreateDepartmentItemCommand : IRequest<object>
    {
        public DepartmentItemHeader Header { get; set; }
    }
}
