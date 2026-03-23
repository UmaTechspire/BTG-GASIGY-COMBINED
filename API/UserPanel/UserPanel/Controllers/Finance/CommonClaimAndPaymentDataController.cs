using Application.Finance.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Finance
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommonClaimAndPaymentDataController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IWebHostEnvironment _env;

        public CommonClaimAndPaymentDataController(IMediator mediator, IWebHostEnvironment env)
        {
            _mediator = mediator;
            _env = env;

        }

        [HttpGet("get-category-type-details")]
        public async Task<ActionResult> GetCategoryDetails(int id, int BranchId, string SearchText, Int32 orgid)
        {

            var result = await _mediator.Send(new CreateCommonClaimAndPaymentCommand()
            {
                opt = 1,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid
            });
            return Ok(result);
        }
        [HttpGet("get-department-details")]
        public async Task<ActionResult> GetDepartMentDetails(int id, int BranchId, string SearchText, Int32 orgid)
        {

            var result = await _mediator.Send(new CreateCommonClaimAndPaymentCommand()
            {
                opt = 2,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid
            });
            return Ok(result);
        }

        [HttpGet("get-applicant-details")]
        public async Task<ActionResult> GetApplicantDetails(int id, int BranchId, string SearchText, Int32 orgid)
        {

            var result = await _mediator.Send(new CreateCommonClaimAndPaymentCommand()
            {
                opt = 3,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid

            });
            return Ok(result);
        }

        [HttpGet("get-transaction-currency")]
        public async Task<ActionResult> GetTransactionCurrency(int id, int BranchId, string SearchText, Int32 orgid)
        {

            var result = await _mediator.Send(new CreateCommonClaimAndPaymentCommand()
            {
                opt = 4,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid

            });
            return Ok(result);
        }
        [HttpGet("get-claim-type")]
        public async Task<ActionResult> GetClaimType(int id, int BranchId, string SearchText, Int32 orgid, Int32 Claimcategoryid)
        {

            var result = await _mediator.Send(new CreateCommonClaimAndPaymentCommand()
            {
                opt = 5,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid,
                categoryid = Claimcategoryid
            });
            return Ok(result);
        }
        [HttpGet("get-payment-description")]
        public async Task<ActionResult> GetPaymentDescription(int id, int BranchId, string SearchText, Int32 orgid, Int32 ClaimTypeid)
        {

            var result = await _mediator.Send(new CreateCommonClaimAndPaymentCommand()
            {
                opt = 6,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid,
                claimtype_id = ClaimTypeid

            });
            return Ok(result);
        }

        [HttpGet("get-supplier-list")]
        public async Task<ActionResult> GetSupplierList(int id, int BranchId, string SearchText, Int32 orgid, Int32 ClaimTypeid)
        {

            var result = await _mediator.Send(new CreateCommonClaimAndPaymentCommand()
            {
                opt = 7,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid,
                claimtype_id = ClaimTypeid

            });
            return Ok(result);
        }

        [HttpGet("GetAllClaimList")]
        public async Task<ActionResult> GetAllClaimList(int id, int BranchId, string SearchText, Int32 orgid, Int32 ClaimTypeid)
        {

            var result = await _mediator.Send(new CreateCommonClaimAndPaymentCommand()
            {
                opt = 8,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid,
                claimtype_id = 0

            });
            return Ok(result);
        }
        [HttpGet("GetPOList")]
        public async Task<ActionResult> GetPOList(int id, int BranchId, string SearchText, Int32 orgid, Int32 supplierid)
        {

            var result = await _mediator.Send(new CreateCommonClaimAndPaymentCommand()
            {
                opt = 9,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid,
                supplierid = supplierid,
                Id=id

            });
            return Ok(result);
        }

        [HttpGet("download-file")]
        public IActionResult DownloadFile([FromQuery] string file_path, Int32 file_id)
        {
            var rootPath = _env.ContentRootPath;

            file_path = file_path.TrimStart('\\', '/');


            var fullPath = Path.Combine(rootPath, file_path);

            if (!System.IO.File.Exists(fullPath))
                return NotFound("File not found.");

            var mimeType = "application/octet-stream"; // Or detect using extension
            var fileName = Path.GetFileName(fullPath);

            var fileBytes = System.IO.File.ReadAllBytes(fullPath);
            return File(fileBytes, mimeType, fileName);
        }

        [HttpGet("GetPaymentdetails")]
        public async Task<ActionResult> GetPaymentdetails(string poid,int orgid)
        {

            var result = await _mediator.Send(new CreateCommonClaimAndPaymentCommand()
            {
                opt = 10,
                searchtext = poid,
               orgid= orgid

            });
            return Ok(result);
        }

    }
}
