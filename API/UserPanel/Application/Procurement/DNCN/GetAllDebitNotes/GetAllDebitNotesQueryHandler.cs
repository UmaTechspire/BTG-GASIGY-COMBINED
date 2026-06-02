using Core.Procurement.DNCN;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Procurement.DNCN.GetAllDebitNotes
{
    public class GetAllDebitNotesQueryHandler : IRequestHandler<GetAllDebitNotesQuery, object>
    {
        private readonly IProcurementDNCNRepository _repository;

        public GetAllDebitNotesQueryHandler(IProcurementDNCNRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllDebitNotesQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetAllDebitNotes();
        }
    }
}
