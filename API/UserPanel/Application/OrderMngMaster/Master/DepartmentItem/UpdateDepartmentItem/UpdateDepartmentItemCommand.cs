using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using static Core.Master.Currency.CurrencyItem;
using static Core.Master.Department.DepartmentItem;

namespace Application.Master.DepartmentItem.UpdateDepartmentItem
{
    public class UpdateDepartmentItemCommand : IRequest<object>
    {
        public DepartmentItemHeader Header { get; set; }
        public int DepartId { get; set; }
    }
}
