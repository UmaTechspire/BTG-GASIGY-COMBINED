using MediatR;

namespace Application.Procurement.DNCN.GetCreditNoteById
{
    public class GetCreditNoteByIdQuery : IRequest<object>
    {
        public int Id { get; set; }
    }
}
