using MediatR;

namespace Application.Procurement.DNCN.DeleteDebitNote
{
    public class DeleteDebitNoteCommand : IRequest<object>
    {
        public int Id { get; set; }
    }
}
