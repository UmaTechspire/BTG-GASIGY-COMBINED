using Application.FinanceModule.Report.GetListBankBook;
using Core.FinanceModule.Report;
using MediatR;

namespace Application.FinanceModule.BankBook.GetListBankBook
{
    public class GetListBankBookQueryHandler : IRequestHandler<GetListBankBookQuery, object>
    {
        private readonly IBankBookRepository _repository;

        public GetListBankBookQueryHandler(IBankBookRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetListBankBookQuery query, CancellationToken cancellationToken)
        {
            var from = query.FromDate ?? new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
            var to = query.ToDate ?? DateTime.Today;
            var list = await _repository.GetListBankBookAsync(from, to, query.BranchId, query.OrgId);
            return list;
        }

    }
}
