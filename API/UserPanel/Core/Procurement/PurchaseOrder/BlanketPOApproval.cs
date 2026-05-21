using System;
using System.Collections.Generic;

namespace Core.Procurement.PurchaseOrder
{
    public class BlanketPOApproval
    {
        public int userid { get; set; }
        public int poid { get; set; }
        public bool isapprovedone { get; set; }
        public bool isdiscussedone { get; set; }
        public bool isapprovedtwo { get; set; }
        public bool isdiscussedtwo { get; set; }
        public string remarks { get; set; }
    }

    public class BlanketPOApprovalHdr
    {
        public List<BlanketPOApproval> approve { get; set; }
        public int UserId { get; set; }
        public int orgid { get; set; }
        public int branchid { get; set; }
    }
}
