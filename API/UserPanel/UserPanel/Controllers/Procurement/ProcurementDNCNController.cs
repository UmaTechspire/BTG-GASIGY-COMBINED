using Application.Procurement.DNCN.CreateCreditNote;
using Application.Procurement.DNCN.CreateDebitNote;
using Application.Procurement.DNCN.DeleteCreditNote;
using Application.Procurement.DNCN.DeleteDebitNote;
using Application.Procurement.DNCN.GetAllCreditNotes;
using Application.Procurement.DNCN.GetAllDebitNotes;
using Application.Procurement.DNCN.GetCreditNoteById;
using Application.Procurement.DNCN.GetDebitNoteById;
using Application.Procurement.DNCN.UpdateCreditNote;
using Application.Procurement.DNCN.UpdateDebitNote;
using Application.Procurement.DNCN.GetItemsByInvoiceId;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace UserPanel.Controllers.Procurement
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProcurementDNCNController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ProcurementDNCNController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("get-all-credit-notes")]
        public async Task<IActionResult> GetAllCreditNotes()
        {
            var result = await _mediator.Send(new GetAllCreditNotesQuery());
            return Ok(result);
        }

        [HttpGet("get-all-debit-notes")]
        public async Task<IActionResult> GetAllDebitNotes()
        {
            var result = await _mediator.Send(new GetAllDebitNotesQuery());
            return Ok(result);
        }

        [HttpGet("get-credit-note/{id}")]
        public async Task<IActionResult> GetCreditNoteById(int id)
        {
            var result = await _mediator.Send(new GetCreditNoteByIdQuery { Id = id });
            return Ok(result);
        }

        [HttpGet("get-debit-note/{id}")]
        public async Task<IActionResult> GetDebitNoteById(int id)
        {
            var result = await _mediator.Send(new GetDebitNoteByIdQuery { Id = id });
            return Ok(result);
        }

        [HttpPost("create-credit-note")]
        public async Task<IActionResult> CreateCreditNote([FromBody] CreateCreditNoteCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPost("create-debit-note")]
        public async Task<IActionResult> CreateDebitNote([FromBody] CreateDebitNoteCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("update-credit-note")]
        public async Task<IActionResult> UpdateCreditNote([FromBody] UpdateCreditNoteCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("update-debit-note")]
        public async Task<IActionResult> UpdateDebitNote([FromBody] UpdateDebitNoteCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpDelete("delete-credit-note/{id}")]
        public async Task<IActionResult> DeleteCreditNote(int id)
        {
            var result = await _mediator.Send(new DeleteCreditNoteCommand { Id = id });
            return Ok(result);
        }

        [HttpDelete("delete-debit-note/{id}")]
        public async Task<IActionResult> DeleteDebitNote(int id)
        {
            var result = await _mediator.Send(new DeleteDebitNoteCommand { Id = id });
            return Ok(result);
        }

        [HttpGet("get-items-by-invoice/{invoiceId}")]
        public async Task<IActionResult> GetItemsByInvoiceId(int invoiceId)
        {
            var result = await _mediator.Send(new GetItemsByInvoiceIdQuery { InvoiceId = invoiceId });
            return Ok(result);
        }
    }
}
