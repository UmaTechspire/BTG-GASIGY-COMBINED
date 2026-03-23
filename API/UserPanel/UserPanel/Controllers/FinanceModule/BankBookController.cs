using Application.FinanceModule.Report.GetListBankBook;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.FinanceModule
{
    [Route("api/[controller]")]
    [ApiController]
    public class BankBookController : ControllerBase
    {
        private readonly IMediator _mediator;

        public BankBookController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetListBankBookAsync([FromQuery] int orgid, [FromQuery] int branchid,
            [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            var result = await _mediator.Send(new GetListBankBookQuery
            {
                OrgId = orgid,
                BranchId = branchid,
                FromDate = fromDate,
                ToDate = toDate
            });

            return Ok(result);
        }



    }
}
