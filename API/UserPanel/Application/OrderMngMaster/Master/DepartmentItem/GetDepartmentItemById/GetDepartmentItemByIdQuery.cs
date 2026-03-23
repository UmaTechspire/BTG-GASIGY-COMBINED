using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using static Core.Master.Currency.CurrencyItem;
using static Core.Master.Department.DepartmentItem;

namespace Application.Master.DepartmentItem.GetDepartmentItemById
{
    public class GetDepartmentItemByIdQuery : IRequest<object>
    {
        public DepartmentItemHeader Header { get; set; }
        public int Id { get; set; }
        public string DepartmentCode { get; set; }
        public string DepartmentName { get; set; }
    }
}
