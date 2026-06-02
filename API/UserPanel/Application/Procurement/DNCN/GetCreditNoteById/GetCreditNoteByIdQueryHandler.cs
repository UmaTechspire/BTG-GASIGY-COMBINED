using Core.Procurement.DNCN;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Procurement.DNCN.GetCreditNoteById
{
    public class GetCreditNoteByIdQueryHandler : IRequestHandler<GetCreditNoteByIdQuery, object>
    {
        private readonly IProcurementDNCNRepository _repository;

        public GetCreditNoteByIdQueryHandler(IProcurementDNCNRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetCreditNoteByIdQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetCreditNoteById(request.Id);
        }
    }
}
