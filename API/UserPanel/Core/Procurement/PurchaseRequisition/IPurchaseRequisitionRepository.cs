using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Models;
using Core.Procurement.PurchaseMemo;

namespace Core.Procurement.PurchaseRequisition
{
    public interface IPurchaseRequisitionRepository
    {
        Task<object> AddAsync(PurchaseRequisition Obj);
        Task<object> UpdateAsync(PurchaseRequisition Obj);
        Task<object> GetByIdAsync(int prid,int branchid,int orgid);
        Task<object> GetAllAsync(Int32 requesterid, Int32 BranchId, Int32 SupplierId,int orgid,int prtypeid, int userid);
        Task<object> GetBySeqNoAsync(int unit,int orgid);
        Task<object> GetRequstorAutoComplete(int branchid, int orgid, string requestorname);
        Task<object> GetSupplierAutoComplete(int branchid, int orgid, string suppliername);
        Task<ResponseModel> UploadDO(int Id, string Path, string FileName);
        Task<object> GetSupplierCurrency(int supplierid,int orgid);
        Task<object> GetMemoList(int branchid,int orgid,int id);
        Task<object> GetMemoItemsList(int branchid, int orgid, int memoid);

        Task<object> UploadDocument(List<RequisitionAttachment> list);

        Task<object> GetPRTypeAutoComplete(int branchid, int orgid, string prtype);
        Task<object> GetProjectsAutoComplete(int branchid, int orgid, string projects);

        Task<object> GetSupplierSearchFilter(int branchid, int orgid, string suppliername);

        Task<object> GetAllPO(int BranchId, int orgid, int PRId);

        Task<object> CancelPRAsync(int prid, int userId, int branchId, int orgId);

    }
}
