using Core.Procurement.DNCN;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Procurement.DNCN.GetAllCreditNotes
{
    public class GetAllCreditNotesQueryHandler : IRequestHandler<GetAllCreditNotesQuery, object>
    {
        private readonly IProcurementDNCNRepository _repository;

        public GetAllCreditNotesQueryHandler(IProcurementDNCNRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllCreditNotesQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetAllCreditNotes();
        }
    }
}
