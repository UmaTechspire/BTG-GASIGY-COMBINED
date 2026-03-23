namespace Core.FinanceModule.PettyCash
{
    public class PettyCash
    {
        public PettyCashHeader Header { get; set; }
    }
    public class PettyCashHeader
    {
        public int? PettyCashId { get; set; }
        public string VoucherNo { get; set; }
        public DateTime ExpDate { get; set; }
        public string? ExpenseType { get; set; }
        public string BillNumber { get; set; }
        public string ExpenseFileName { get; set; }
        public string ExpenseFilePath { get; set; }
        public DateTime FileUpdatedDate { get; set; }
        public string Who { get; set; }
        public string Whom { get; set; }
        public decimal AmountIDR { get; set; }
        public int ExpenseDescriptionId { get; set; }
        public bool IsActive { get; set; }
        public int userid { get; set; }
        public string CreatedIP { get; set; }
        public string ModifiedIP { get; set; }
        public int BranchId { get; set; }
        public int OrgId { get; set; }
        public bool IsSubmitted { get; set; }
    }
}
