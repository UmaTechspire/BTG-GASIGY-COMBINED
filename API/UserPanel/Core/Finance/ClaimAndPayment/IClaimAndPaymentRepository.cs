using Core.Models;
using System.Threading.Tasks;

namespace Core.Finance.ClaimAndPayment
{
    public interface IClaimAndPaymentRepository
    {
        Task<object> DeleteClaim(InActiveClaim obj);
        Task<object> AddAsync(ClaimAndPaymentModel obj);
        Task<object> UpdateAsync(ClaimAndPaymentModel obj);
        Task<object> GetAllAsync(int requesterId, int branchId, int orgid,Int32 departmentid,Int32 categoryid,Int32 currencyid, Int32 user_id,Int32 claimtypeid);
        Task<object> GetByIdAsync(int id, int orgid);
        Task<ResponseModel> UploadDO(int Id, string Path, string FileName);
        Task<object> GetSequencesNo(int branchId, int orgid,int userid);
        Task<object> GetClaimHistory(string fromdate, string todate, int branchid, int orgid);
        Task<object> DiscussClaim(DiscussClaim obj);
        Task<object> ClaimComments(Int32 claimid, Int32 level);
    }
}
