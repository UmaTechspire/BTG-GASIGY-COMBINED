namespace Core.Finance.Master
{
    public interface IClaimAndPaymentCommonMasterRepository
    {
        Task<object> GetCategoryDetails(Int32 id,Int32 branchid, string Searchtext, Int32 orgid);
        Task<object> GetDepartMentDetails(Int32 id,Int32 branchid, string Searchtext, Int32 orgid);
        Task<object> GetApplicantDetails(Int32 id,Int32 branchid, string Searchtext, Int32 orgid);
        Task<object> GetTransactionCurrency(Int32 id,Int32 branchid, string Searchtext, Int32 orgid);
        Task<object> GetClaimType(Int32 id,Int32 branchid, string Searchtext, Int32 orgid,Int32 categoryid );
        Task<object> GetPaymentDescription(Int32 id, Int32 branchid, string Searchtext,Int32 orgid, Int32 claimtypeid);
        Task<object> GetSupplierList(Int32 id, Int32 branchid, string Searchtext, Int32 orgid, Int32 claimtypeid);
        Task<object> GetAllClaimList(Int32 id, Int32 branchid, string Searchtext, Int32 orgid, Int32 claimtypeid);

        Task<object> GetPOList(Int32 id, Int32 branchid, string Searchtext, Int32 orgid, Int32 supplierid);
        Task<object> GetPaymentdetails(string poid,Int32 orgid);
    }
}
