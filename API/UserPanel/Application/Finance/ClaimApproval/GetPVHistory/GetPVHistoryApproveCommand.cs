using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Finance.ClaimApproval.GetPVHistory
{
    public class GetPVHistoryApproveCommand : IRequest<object>
    {
        public int id { get; set; }
        public int userid { get; set; }
        public int OrgId { get; set; }
        public Int32 BranchId { get; set; }
        public string fromdate { get; set; }
        public string todate { get; set; }
    }
}
