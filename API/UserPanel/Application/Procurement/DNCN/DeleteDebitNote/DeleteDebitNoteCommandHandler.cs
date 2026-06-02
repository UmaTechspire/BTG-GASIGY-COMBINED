using Core.Procurement.DNCN;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Procurement.DNCN.DeleteDebitNote
{
    public class DeleteDebitNoteCommandHandler : IRequestHandler<DeleteDebitNoteCommand, object>
    {
        private readonly IProcurementDNCNRepository _repository;

        public DeleteDebitNoteCommandHandler(IProcurementDNCNRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(DeleteDebitNoteCommand request, CancellationToken cancellationToken)
        {
            return await _repository.DeleteDebitNote(request.Id);
        }
    }
}
