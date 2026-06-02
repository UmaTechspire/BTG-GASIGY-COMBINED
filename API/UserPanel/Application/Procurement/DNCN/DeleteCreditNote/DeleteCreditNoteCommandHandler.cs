using Core.Procurement.DNCN;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Procurement.DNCN.DeleteCreditNote
{
    public class DeleteCreditNoteCommandHandler : IRequestHandler<DeleteCreditNoteCommand, object>
    {
        private readonly IProcurementDNCNRepository _repository;

        public DeleteCreditNoteCommandHandler(IProcurementDNCNRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(DeleteCreditNoteCommand request, CancellationToken cancellationToken)
        {
            return await _repository.DeleteCreditNote(request.Id);
        }
    }
}
