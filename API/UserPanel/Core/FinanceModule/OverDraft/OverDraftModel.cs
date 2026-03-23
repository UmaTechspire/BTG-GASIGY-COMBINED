namespace Core.FinanceModule.OverDraft
{
    public class OverDraftModel
    {
        public OverDraftHeader Header { get; set; }
    }
    public class OverDraftHeader
    {
        public int? OverDraftId { get; set; }
        public string VoucherNo { get; set; }
        public DateTime OverDraftDate { get; set; }
        public string? OverDraftType { get; set; }
        public string Bank { get; set; }
        public string InterestType { get; set; }
        public decimal ODInterest { get; set; }
        public decimal ODAmountIDR { get; set; }
        public int RepayInMonths { get; set; }
        public decimal FinalSettlementAmount { get; set; }
        public DateTime FinalSettlementDate { get; set; }
        public bool IsActive { get; set; }
        public int userid { get; set; }
        public string CreatedIP { get; set; }
        public string ModifiedIP { get; set; }
        public int BranchId { get; set; }
        public int OrgId { get; set; }
        public bool IsSubmitted { get; set; }
    }
}

