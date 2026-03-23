namespace Core.FinanceModule.Revenue
{
    public class RevenueModel
    {
        public RevenueHeader Header { get; set; }
    }
    public class RevenueHeader
    {
        public int? RevenueId { get; set; }
        public string VoucherNo { get; set; }
        public DateTime ReceivedDate { get; set; }
        public string? RevenueType { get; set; }
        public string Description { get; set; }
        public string Whom { get; set; }
        public decimal AmountIDR { get; set; }
        public int RevenueTypeId { get; set; }
        public string Remarks { get; set; }
        public bool IsActive { get; set; }
        public int userid { get; set; }
        public string CreatedIP { get; set; }
        public string ModifiedIP { get; set; }
        public int BranchId { get; set; }
        public int OrgId { get; set; }
        public bool IsSubmitted { get; set; }
    }
}

