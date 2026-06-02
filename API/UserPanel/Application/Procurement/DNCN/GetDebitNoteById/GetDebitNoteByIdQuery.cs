using MediatR;

namespace Application.Procurement.DNCN.GetDebitNoteById
{
    public class GetDebitNoteByIdQuery : IRequest<object>
    {
        public int Id { get; set; }
    }
}
