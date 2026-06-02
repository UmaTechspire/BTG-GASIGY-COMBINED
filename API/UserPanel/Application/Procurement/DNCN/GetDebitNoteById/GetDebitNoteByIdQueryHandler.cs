using Core.Procurement.DNCN;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Procurement.DNCN.GetDebitNoteById
{
    public class GetDebitNoteByIdQueryHandler : IRequestHandler<GetDebitNoteByIdQuery, object>
    {
        private readonly IProcurementDNCNRepository _repository;

        public GetDebitNoteByIdQueryHandler(IProcurementDNCNRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetDebitNoteByIdQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetDebitNoteById(request.Id);
        }
    }
}
