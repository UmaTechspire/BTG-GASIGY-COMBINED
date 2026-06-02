using MediatR;

namespace Application.Procurement.DNCN.DeleteCreditNote
{
    public class DeleteCreditNoteCommand : IRequest<object>
    {
        public int Id { get; set; }
    }
}
