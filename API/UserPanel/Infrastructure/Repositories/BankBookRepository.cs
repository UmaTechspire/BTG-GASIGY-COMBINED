using Core.Abstractions;
using Core.FinanceModule.Report;
using Dapper;
using System.Data;

namespace Infrastructure.Repositories
{
    public class BankBookRepository : IBankBookRepository
    {
        private readonly IDbConnection _connection;

        public BankBookRepository(IUnitOfWorkDB3 financedb)
        {
            _connection = financedb.Connection;
        }

        public async Task<IEnumerable<object>> GetListBankBookAsync(DateTime? fromDate, DateTime? toDate, int branchId, int orgId)
        {
            var param = new DynamicParameters();
            param.Add("@p_fromDate", fromDate);
            param.Add("@p_toDate", toDate);
            param.Add("@p_branchId", branchId);
            param.Add("@p_orgId", orgId);
            param.Add("@p_openingBalance", 50000); //for Test

            var result = await _connection.QueryAsync<object>("proc_finance_BankBook", param,
                commandType: CommandType.StoredProcedure);

            return result;
        }


    }
}