using Application.Finance.ClaimAndPayment.Create;
using Application.Finance.ClaimAndPayment.Delete;
using Application.Finance.ClaimAndPayment.Discuss;
using Application.Finance.ClaimAndPayment.GetById;
using Application.Finance.ClaimAndPayment.GetList;
using Application.Finance.ClaimAndPayment.GetSequencesNumber;
using Application.Finance.ClaimAndPayment.Update;
using Application.Finance.ClaimApproval.ClaimComments;
using Application.Finance.ClaimHistory;
using Core.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Finance
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClaimAndPaymentController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ClaimAndPaymentController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Create new claim and payment.
        /// </summary>
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateClaimAndPaymentCommand command)
        {
            if (command == null) return BadRequest("Invalid payload.");
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        /// <summary>
        /// Update existing claim and payment.
        /// </summary>
        [HttpPut("update")]
        public async Task<IActionResult> Update([FromBody] UpdateClaimAndPaymentCommand command)
        {
            if (command == null) return BadRequest("Invalid payload.");
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        /// <summary>
        /// Upload a document for claim and payment.
        /// </summary>
        [HttpPost("upload-doc")]
        public async Task<IActionResult> UploadDocument(IFormFile file, [FromForm] int claimPaymentId, [FromForm] int BranchId, [FromForm] int UserId)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");
            if (claimPaymentId <= 0) return BadRequest("Invalid claimPaymentId.");

            try
            {
                var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "UploadedFiles", "ClaimAndPayment", claimPaymentId.ToString());
                if (!Directory.Exists(uploadDir))
                {
                    Directory.CreateDirectory(uploadDir);
                }

                var filePath = Path.Combine(uploadDir, file.FileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var result = await _mediator.Send(new UploadClaimAndPaymentCommand
                {
                    Id = claimPaymentId,
                    Path = filePath,
                    UserId = UserId,
                    BranchId = BranchId,
                    filename = file.FileName
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseModel
                {
                    Status = false,
                    Message = "Upload failed due to server error."
                });
            }
        }

        /// <summary>
        /// Get all claim and payments by requester.
        /// </summary>
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll([FromQuery] int departmentid, [FromQuery] int currencyid, [FromQuery] int categoryid, [FromQuery] int branchId, [FromQuery] int orgid, Int32 user_id, Int32 claimtypeid)
        {
            var result = await _mediator.Send(new GetListClaimAndPaymentCommand
            {
                OrgId = orgid,
                BranchId = branchId,
                departmentid = departmentid,
                categoryid = categoryid,
                currencyid = currencyid,
                user_id = user_id,
                claimtypeid = claimtypeid


            });
            return Ok(result);
        }

        // <summary>
        // Get a claim and payment by ID.
        // </summary>
        [HttpGet("get-by-id")]
        public async Task<IActionResult> GetById([FromQuery] int claimId, int orgId, int branchId)
        {
            var result = await _mediator.Send(new GetByIdClaimAndPaymentCommand
            {
                Id = claimId,
                orgid = orgId
            });

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("get-seq-num")]
        public async Task<IActionResult> GetSequenceNumber(Int32 BranchId, Int32 orgid, int userid)
        {
            var result = await _mediator.Send(new GetSequencesNumberClaimAndPayment() { BranchId = BranchId, orgid = orgid, userid = userid });
            return Ok(result);
        }


        [HttpPost("Delete")]
        public async Task<IActionResult> Delete([FromBody] DeleteClaimAndPaymentCommand command)
        {
            if (command == null) return BadRequest("Invalid payload.");
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPost("Discuss")]
        public async Task<IActionResult> Discuss([FromBody] DiscussClaimAndPaymentCommand command)
        {
            if (command == null) return BadRequest("Invalid payload.");
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("get-claimhistory")]
        public async Task<IActionResult> GetClaimHistory([FromQuery] string fromdate, [FromQuery] string todate, int branchId, int orgId)
        {
            var result = await _mediator.Send(new GetAllClaimHistoryCommand
            {
                fromdate = fromdate,
                todate = todate,
                branchid = branchId,
                orgid = orgId
            });

            if (result == null)
                return NotFound();

            return Ok(result);
        }

         [HttpGet("getcommentreply")]
        public async Task<IActionResult> getcommentreply(Int32 claimid, Int32 level)
        {
            var result = await _mediator.Send(new ClaimCommentsCommand() { claimid=claimid,level=level });
            return Ok(result);
        }
    }
}
