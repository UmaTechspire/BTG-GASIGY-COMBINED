using DocumentFormat.OpenXml.Office2019.Drawing.Model3D;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Finance.Approval
{

    public class PPPApproval
    {
        public int userid { get; set; }
        public int claimid { get; set; }
        public bool isapproved { get; set; }
        public bool isdiscussed { get; set; }
        public string GmComment { get; set; }
        public int level { get; set; }
    }

    public class ClaimReply
    {
        public int userid { get; set; }
        public int claimid { get; set; }
        public string GmComment { get; set; }
        public int level { get; set; }
    }
    public class ClaimApproval
    {
        //public int isreply { get; set; }
        //public string approve_trans { get; set; }
        //public int level { get; set; }
        public int userid { get; set; }
        public int claimid { get; set; }
        public bool ppp_commissioner_approvalone { get; set; }

        public bool isapprovedeight { get; set; }
        public bool isdiscussedeight { get; set; }

        public bool isapprovedone { get; set; }
        public bool isdiscussedone { get; set; }
        public bool isapprovedtwo { get; set; }
        public bool isdiscussedtwo { get; set; }
        public bool ppp_commissioner_discussed { get; set; }
        public bool ppp_gm_approvalone { get; set; }
        public bool ppp_director_approvalone { get; set; }

        public bool ppp_gm_discussed { get; set; }      
        public bool ppp_director_discussed { get; set; }   
        public bool ppp_pv_Commissioner_discussedone { get; set; }
        public bool PPP_PV_Commissioner_approveone { get; set; }

        public string remarks { get; set; }

        public bool GmComment { get; set; }
    }


    public class ClaimApprovalHdr
    {
        public List<ClaimApproval> approve { get; set; }
        public Int32 UserId { get; set; }
        public Int32 orgid { get; set; }
        public Int32 branchid { get; set; }
        public Int32 operation { get; set; }
        public Int32 type { get; set; }
        public Int32 summaryid { get; set; }
        public Int32 isppp_pv { get; set; }
        public string remarks { get; set; }
    }

    public class RejectDetails
    {
    public List<RejectedClaims> Reject { get; set; }
    public Int32 UserId { get; set; }

        public Int32 IsPPP { get; set; }
    }

    public class RejectedClaims
    {
        public Int32 Id { get; set; }
    }
}
