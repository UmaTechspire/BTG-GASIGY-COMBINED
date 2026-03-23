namespace Core.FinanceModule.Report
{
    public interface IBankBookRepository
    {
        Task<IEnumerable<object>> GetListBankBookAsync(DateTime? fromDate, DateTime? toDate, int branchid, int orgid);

    }
}
