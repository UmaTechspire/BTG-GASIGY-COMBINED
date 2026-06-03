using BackEnd.Procurement.PurchaseMemo;
using BackEnd.Procurement.PurchaseRequitision;
using Core.Abstractions;
using Core.Models;
using Core.OrderMng.Invoices;
using Core.Procurement.PurchaseMemo;
using Core.Procurement.PurchaseRequisition;
using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UserPanel.Infrastructure.Data;

namespace Infrastructure.Repositories
{
    public class PurchaseRequisitionRepository : IPurchaseRequisitionRepository
    {
        private readonly IDbConnection _connection;
        string IPAddress = "";
        public PurchaseRequisitionRepository(IUnitOfWorkDB2 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }


        public async Task<SharedModelWithResponse> GetSeqNumber(int id, string text, int type, int unit, int orgid)
        {

            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 1);
                param.Add("@id", id);
                param.Add("@text", text);
                param.Add("@type", type);
                param.Add("@branchid", unit);
                param.Add("@orgid", orgid);


                var data = await _connection.QueryFirstOrDefaultAsync<SharedModel>("proc_shared", param: param, commandType: CommandType.StoredProcedure);



                return new SharedModelWithResponse()
                {
                    Data = data,
                    Message = "Success",
                    Status = true
                };


            }
            catch (Exception Ex)
            {

                return new SharedModelWithResponse()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }


        }

        public async Task<object> AddAsync(PurchaseRequisition Obj)
        {
            try
            {


                int IsValidated = 0;
                string Message = "";
                Int32 Result = 0;
                SharedRepository SR = new SharedRepository(_connection);

                var response = await GetSeqNumber(0, Obj.Header.PR_Number, 2, Obj.Header.BranchId, Obj.Header.OrgId);
                if (response.Status == true)
                {
                    if (response.Data.result == 1)
                    {
                        IsValidated = 1;
                        Message = " - The current PR  number " + Obj.Header.PR_Number + " is taken for another PR so the new PR number (" + response.Data.text + ") has been generated for this PR";
                        Obj.Header.PR_Number = response.Data.text;
                    }
                }
                if (Obj.Header.DeptId == 0 && Obj.Details != null && Obj.Details[0].DeptId != 0)
                {
                    Obj.Header.DeptId = Obj.Details[0].DeptId;
                }

                const string headerSql = @"
INSERT INTO `tbl_PurchaseRequisition_Header`(
`PR_Number`,
    `PRDate`,
    `PRTypeId`,
    `SupplierId`,
    `RequestorId`,
    `DeptId`,
    `PaymentTermId`,
    `DeliveryTerm`,
    `BTGDeliveryAddress`,
    `Remarks`,
    `QuotationFileName`,
    `QuotationFilePath`,
    `FileUpdatedDate`,
    `IsSubmitted`,
    `CreatedDt`,
    `CreatedBy`,
    `CreatedIP`,
    `IsActive`,
    `OrgId`,
    `BranchId`,
    `currencyid`,
    `exchangerate`,
    `PaymentTermName`,
    `prTypeName`,
    `DeliveryTermId`,
    `Memoremarks`,
    `ProjectId`,
    `poreference`,
    `po_ref_id`,
    `SubTotal`,
    `DiscountValue`,
    `TaxValue`,
    `VatValue`,
    `NetTotal`
  
)
VALUES (
    @PR_Number,
    @PRDate,
    @PRTypeId,
    @SupplierId,
    @RequestorId,
    @DeptId,
    @PaymentTermId,
    @DeliveryTerm,
    @BTGDeliveryAddress,
    @Remarks,
    @QuotationFileName,
    @QuotationFilePath,
    @FileUpdatedDate,
    @IsSubmitted,
    NOW(),
    @userid,
    '',
    1,
    @OrgId,
    @BranchId,
    @currencyid,
    @exchangerate,
    @PaymentTermName,
    @prTypeName,
    @DeliveryTermId,
    @Memoremarks,
    @ProjectId,
    @poreference,
    @po_ref_id,
    @SubTotal,
    @DiscountValue,
    @TaxValue,
    @VatValue,
    @NetTotal 
   
);";


                await _connection.ExecuteAsync(headerSql, Obj.Header);

                const string getLastInsertedIdSql = "SELECT LAST_INSERT_ID();";
                var insertedHeaderId = await _connection.QuerySingleAsync<int>(getLastInsertedIdSql);

                string detailsql = "";
                foreach (var row in Obj.Details)
                {
                    row.PRId = insertedHeaderId;

                    detailsql += @"
                INSERT INTO  `tbl_PurchaseRequisition_Detail`(`PRId`, `MEMO_ID`, `MEMO_dtl_Id`, `ItemId`, `UOM`, `Qty`, `UnitPrice`, `TotalValue`, 
                `TaxPerc`, `TaxValue`, `SubTotal`, `DiscountPerc`, `DiscountValue`, `NetTotal`, `IsActive`, `CreatedDt`, 
                `CreatedBy`, `CreatedIP`,`ItemGroupId`,`vatPerc`,`vatValue`,`taxcalctype`,`taxid`,`vatid`)
                select " + row.PRId + "," + row.MEMO_ID + "," + row.MEMO_dtl_Id + "," + row.ItemId + "," + row.UOM + "," + row.Qty + "," +
                "" + row.UnitPrice + "," + row.TotalValue + "," + row.TaxPerc + "," + row.TaxValue + "," + row.SubTotal + "," + row.DiscountPerc + "," + row.DiscountValue + "," +
                "" + row.NetTotal + ",1,NOW()," + row.userid + ",'',"+row.ItemGroupId+","+row.vatPerc+","+row.vatValue+","+row.taxcalctype+","+row.taxid+","+row.vatid+"; ";


                }
                Result = await _connection.ExecuteAsync(detailsql);



                int BranchId = Obj.Header.BranchId;
                var updateSeq = "UPDATE master_documentnumber SET Doc_Number = Doc_Number + 1 WHERE Doc_Type = 2 AND Unit = @BranchId; update tbl_purchasememo_header  as a inner join tbl_PurchaseRequisition_Detail as b on a.MEMO_ID=b.Memo_ID and a.isactive=1 set IsPrUtil=1 where b.PRId=@PRId;";
                Result = await _connection.ExecuteAsync(updateSeq, new { BranchId=BranchId, PRId = insertedHeaderId });
                Result = 1;

                if (Result == 0)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Save failed",
                        Status = false
                    };
                }
                else
                {
                    if (Obj.Header.IsSubmitted == 0)
                    {
                        return new ResponseModel()
                        {
                            Data = insertedHeaderId, 
                            Message = "Saved Successfully" + Message,
                            Status = true
                        };
                    }
                    else
                    {
                        return new ResponseModel()
                        {
                            Data = insertedHeaderId,
                            Message = "Posted Successfully" + Message,
                            Status = true
                        };
                    }
                }
            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }

        public async Task<object> GetAllAsync(Int32 requesterid, int BranchId, int SupplierId, int orgid, int PRTypeid,int userid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 1);
                param.Add("@PRId", 0);
                param.Add("@BranchId", BranchId);
                param.Add("@OrgID", orgid);
                param.Add("@RequestorId", requesterid);
                param.Add("@SupplierId", SupplierId);
                param.Add("@requstorname", null, DbType.String);
                param.Add("@suppliername", null, DbType.String);
                param.Add("@memoid", 0);
                param.Add("@PRTypeid", PRTypeid);
                param.Add("@Prtype", null, DbType.String);
                param.Add("@user_id", userid);

                var List = await _connection.QueryAsync(PurchaseRequitisionBackEnd.PurchaseRequitionProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();


                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };


            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }

        public async Task<object> GetByIdAsync(int prid, int branchid, int orgid)
        {
            try
            {
                var param = new DynamicParameters();
                //param.Add("@opt", 3);
                //param.Add("@PRId", prid);
                //param.Add("@BranchId", branchid);
                //param.Add("@OrgID", orgid);
                //param.Add("@RequestorId", 0);
                //param.Add("@SupplierId", 0);
                //param.Add("@requstorname", null, DbType.String);
                //param.Add("@suppliername", null, DbType.String);
                //param.Add("@memoid", 0);
                param.Add("@opt", 3);
                param.Add("@SupplierId", 0);
                param.Add("@RequestorId", 0);
                param.Add("@PRId", prid);
                param.Add("@BranchId", branchid);
                param.Add("@OrgID", orgid);
                param.Add("@requstorname", "", DbType.String);
                param.Add("@suppliername", "", DbType.String);
                param.Add("@memoid", 0);
                param.Add("@PRTypeid", 0);
                param.Add("@Prtype", null, DbType.String);
                param.Add("@user_id", 0);
                var List = await _connection.QueryMultipleAsync(PurchaseRequitisionBackEnd.PurchaseRequitionProcedure, param: param, commandType: CommandType.StoredProcedure);
                dynamic Modellist = new ExpandoObject();
                int I = 0;
                while (!List.IsConsumed)
                {
                    dynamic nl = List.Read();

                    if (I == 0)
                    {
                        int count = nl.Count;
                        if (count == 0)
                        {
                            Modellist.Header = new object();
                        }
                        else
                        {
                            Modellist.Header = nl[0];
                        }
                    }
                    else if (I == 1)
                    {
                        Modellist.Details = nl;
                    }
                    else if( I== 2)
                    {
                        Modellist.Attachment = nl;
                    }

                    I++;
                }
                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };


            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }

        public async Task<object> GetBySeqNoAsync(int unit, int orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 2);
                param.Add("@PRId", 0);
                param.Add("@BranchId", unit);
                param.Add("@OrgID", orgid);
                param.Add("@RequestorId", 0);
                param.Add("@SupplierId", 0);
                param.Add("@requstorname", null, DbType.String);
                param.Add("@suppliername", null, DbType.String);
                param.Add("@memoid", 0);
                param.Add("@PRTypeid", 0);
                param.Add("@Prtype", null, DbType.String);
                param.Add("@user_id", 0);
                var data = await _connection.QueryFirstOrDefaultAsync(PurchaseRequitisionBackEnd.PurchaseRequitionProcedure, param: param, commandType: CommandType.StoredProcedure);

                return new ResponseModel()
                {
                    Data = data,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }


        }
        public async Task<object> UpdateAsync(PurchaseRequisition Obj)
        {
            try
            {
                // 1. Update Header
                const string headerSql = @"
        UPDATE tbl_PurchaseRequisition_Header
        SET 
            PRTypeId = @PRTypeId,
            PRDate = @PRDate,
            SupplierId = @SupplierId,
            RequestorId = @RequestorId,
            DeptId = @DeptId,
            prTypeName = @prTypeName,       
            PaymentTermName = @PaymentTermName, 
            PaymentTermId = @PaymentTermId,
            DeliveryTerm = @DeliveryTerm,
            BTGDeliveryAddress = @BTGDeliveryAddress,
            Remarks = @Remarks,
            QuotationFileName = @QuotationFileName,
            QuotationFilePath = @QuotationFilePath,
            FileUpdatedDate = @FileUpdatedDate,
            ModifiedDt = NOW(),
            ModifiedBy = @userid,
            ModifiedIP = @ModifiedIP,
            IsActive = @IsActive,
            OrgId = @OrgId,
            BranchId = @BranchId,
            DeliveryTermId =@DeliveryTermId,
            currencyid = @currencyid,
            exchangerate = @exchangerate,
            Memoremarks = @Memoremarks,
            IsSubmitted=@IsSubmitted ,
            ProjectId=@ProjectId,
            poreference=@poreference,
            po_ref_id =@po_ref_id,
            pr_director_isdiscussed =0,
            pr_gm_isdiscussed=0,
            SubTotal = @SubTotal,
            DiscountValue = @DiscountValue,
            TaxValue = @TaxValue,
            VatValue = @VatValue,
            NetTotal = @NetTotal
            WHERE PRId = @PRId";

                await _connection.ExecuteAsync(headerSql, Obj.Header);

                // 2. Soft delete old detail rows
                const string softDeleteDetailsSql = @"UPDATE tbl_PurchaseRequisition_Detail SET IsActive = 0 WHERE PRId = @PRId;update tbl_purchasememo_header  as a inner join tbl_PurchaseRequisition_Detail as b on a.MEMO_ID=b.Memo_ID and a.isactive=1 set IsPrUtil=0 where b.PRId=@PRId";
                await _connection.ExecuteAsync(softDeleteDetailsSql, new { PRId = Obj.Header.PRId });



                string updatequery = "";
                foreach (var row in Obj.Details)
                {

                    if (row.PRDId == 0)
                    {
                        updatequery += @" INSERT INTO tbl_PurchaseRequisition_Detail
                        (PRId, MEMO_ID, MEMO_dtl_Id, ItemId, UOM, Qty, UnitPrice, TotalValue, TaxPerc, TaxValue, SubTotal,
                        DiscountPerc, DiscountValue, NetTotal, IsActive, CreatedDt, CreatedBy, CreatedIP,ItemGroupId,vatPerc,vatValue,taxcalctype,taxid,vatid)
                        VALUES (" + row.PRId + ", " + row.MEMO_ID + ", " + row.MEMO_dtl_Id + ", " + row.ItemId + ", " + row.UOM + ", " + row.Qty + ", " + row.UnitPrice + ", " + row.TotalValue + "," +
                        "" + row.TaxPerc + ", " + row.TaxValue + ", " + row.SubTotal + "," + row.DiscountPerc + ", " + row.DiscountValue + ", " + row.NetTotal + ", 1, NOW(), " + row.userid + ", ''," + row.ItemGroupId + ","+row.vatPerc+","+row.vatValue+","+row.taxcalctype+","+row.taxid+","+row.vatid+");";
                    }
                    else
                    {
                        updatequery += @"update tbl_PurchaseRequisition_Detail set PRId = " + row.PRId + "," +
                            "MEMO_ID = " + row.MEMO_ID + ", " +
                            "MEMO_dtl_Id = " + row.MEMO_dtl_Id + "," +
                            "ItemId = " + row.ItemId + "," +
                            "UOM = " + row.UOM + "," +
                            "Qty = " + row.Qty + "," +
                            "UnitPrice = " + row.UnitPrice + "," +
                            "TotalValue = " + row.TotalValue + "," +
                            "TaxPerc = " + row.TaxPerc + "," +
                            "TaxValue = " + row.TaxValue + "," +
                            "SubTotal = " + row.SubTotal + "," +
                            "DiscountPerc = " + row.DiscountPerc + "," +
                            "DiscountValue = " + row.DiscountValue + "," +
                            "NetTotal = " + row.NetTotal + "," +
                            "IsActive = 1," +
                            "ItemGroupId = " + row.ItemGroupId + "," +
                            "ModifiedDt = NOW()," +
                            "ModifiedBy = " + row.userid + "," +

                            "vatPerc = " + row.vatPerc + "," +
                            "vatValue = " + row.vatValue + "," +
                            "taxcalctype = " + row.taxcalctype + " ," +
                            "taxid = "+row.taxid+" ,"+
                            "vatid = " + row.vatid + " " +
                            " where prdid = " + row.PRDId + ";";
                    }
                }

                Int32 Result = 0;
                Result =  await _connection.ExecuteAsync(updatequery);

                const string updateismemoused = @"update tbl_purchasememo_header  as a inner join tbl_PurchaseRequisition_Detail as b on a.MEMO_ID=b.Memo_ID and a.isactive=1 set IsPrUtil=1 where b.PRId=@PRId";
                await _connection.ExecuteAsync(updateismemoused, new { PRId = Obj.Header.PRId });



                //        // 3. Reinsert or reactivate details
                //        const string insertSql = @"
                //INSERT INTO tbl_PurchaseRequisition_Detail
                //(PRId, MEMO_ID, MEMO_dtl_Id, ItemId, UOM, Qty, UnitPrice, TotalValue, TaxPerc, TaxValue, SubTotal,
                // DiscountPerc, DiscountValue, NetTotal, IsActive, CreatedDt, CreatedBy, CreatedIP,ItemGroupId)
                //VALUES
                //(@PRId, @MEMO_ID, @MEMO_dtl_Id, @ItemId, @UOM, @Qty, @UnitPrice, @TotalValue, @TaxPerc, @TaxValue, @SubTotal,
                // @DiscountPerc, @DiscountValue, @NetTotal, 1, NOW(), @userid, @CreatedIP,@ItemGroupId)";

                //        const string reactivateSql = @"UPDATE tbl_PurchaseRequisition_Detail SET IsActive = 1 WHERE PRDId = @PRDId;";



                //        foreach (var row in Obj.Details)
                //        {
                //            row.PRId = Obj.Header.PRId;
                //            row.userid = Obj.Header.userid;
                //            row.CreatedIP = Obj.Header.CreatedIP ?? "";

                //            if (row.PRDId == 0)
                //            {
                //                await _connection.ExecuteAsync(insertSql, row);
                //            }
                //            else
                //            {
                //                await _connection.ExecuteAsync(reactivateSql, new { PRDId = row.PRDId });
                //            }
                //        }

                // 4. Return success message
                return new ResponseModel
                {
                    Data = null,
                    Message = Obj.Header.IsSubmitted == 0
                        ? "Purchase Requisition updated successfully"
                        : "Purchase Requisition posted successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Something went wrong: " + ex.Message,
                    Status = false
                };
            }
            //    try
            //    {
            //        // 1. Update Header
            //        const string headerSql = @"
            //UPDATE tbl_PurchaseRequisition_Header
            //SET 
            //    PRTypeId = @PRTypeId,
            //    SupplierId = @SupplierId,
            //    RequestorId = @RequestorId,
            //    DeptId = @DeptId,
            //    PaymentTermId = @PaymentTermId,
            //    DeliveryTerm = @DeliveryTerm,
            //    BTGDeliveryAddress = @BTGDeliveryAddress,
            //    Remarks = @Remarks,
            //    QuotationFileName = @QuotationFileName,
            //    QuotationFilePath = @QuotationFilePath,
            //    FileUpdatedDate = @FileUpdatedDate,
            //    ModifiedDt = NOW(),
            //    ModifiedBy = @userid,
            //    ModifiedIP = @ModifiedIP,
            //    IsActive = @IsActive,
            //    OrgId = @OrgId,
            //    BranchId = @BranchId,
            //    currencyid = @currencyid,
            //    exchangerate = @exchangerate
            //WHERE PRId = @PRId";

            //        await _connection.ExecuteAsync(headerSql, Obj.Header);

            //        // 2. Soft delete existing details
            //        const string deleteDetailsSql = @"
            //UPDATE tbl_PurchaseRequisition_Detail 
            //SET IsActive = 0 
            //WHERE PRId = @PRId";

            //        await _connection.ExecuteAsync(deleteDetailsSql, new { PRId = Obj.Header.PRId });

            //        // 3. Insert or Reactivate details
            //        const string insertSql = @"
            //INSERT INTO tbl_PurchaseRequisition_Detail
            //(PRId, MEMO_ID, MEMO_dtl_Id, ItemId, UOM, Qty, UnitPrice, TotalValue, TaxPerc, TaxValue, SubTotal, DiscountPerc, DiscountValue, NetTotal, IsActive, CreatedDt, CreatedBy, CreatedIP)
            //VALUES
            //(@PRId, @MEMO_ID, @MEMO_dtl_Id, @ItemId, @UOM, @Qty, @UnitPrice, @TotalValue, @TaxPerc, @TaxValue, @SubTotal, @DiscountPerc, @DiscountValue, @NetTotal, 1, NOW(), @userid, @CreatedIP)";

            //        const string reactivateSql = @"
            //UPDATE tbl_PurchaseRequisition_Detail 
            //SET IsActive = 1,
            //    ModifiedDt = NOW(),
            //    ModifiedBy = @ModifiedBy,
            //    ModifiedIP = @ModifiedIP
            //WHERE PRDId = @PRDId";

            //        foreach (var row in Obj.Details)
            //        {
            //            row.userid = Obj.Header.userid;
            //            row.CreatedIP = Obj.Header.CreatedIP ?? "";
            //            row.PRId = Obj.Header.PRId;

            //            if (row.PRDId == 0)
            //            {
            //                await _connection.ExecuteAsync(insertSql, row);
            //            }
            //            else
            //            {
            //                await _connection.ExecuteAsync(reactivateSql, new
            //                {
            //                    PRDId = row.PRDId,
            //                    ModifiedBy = Obj.Header.userid,
            //                    ModifiedIP = Obj.Header.ModifiedIP ?? ""
            //                });
            //            }
            //        }

            //        // 4. Return Response
            //        return new ResponseModel
            //        {
            //            Data = null,
            //            Message = Obj.Header.IsSubmitted == 0
            //                ? "Purchase Memo updated successfully"
            //                : "Purchase Memo posted successfully",
            //            Status = true
            //        };
            //    }
            //    catch (Exception ex)
            //    {
            //        return new ResponseModel
            //        {
            //            Data = null,
            //            Message = "Something went wrong: " + ex.Message,
            //            Status = false
            //        };
            //    }
        }


        public async Task<object> GetRequstorAutoComplete(int branchid, int orgid, string requestorname)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 5);
                param.Add("@PRId", 0);
                param.Add("@BranchId", branchid);
                param.Add("@OrgID", orgid);
                param.Add("@RequestorId", 0);
                param.Add("@SupplierId", 0);
                param.Add("@requstorname", requestorname);
                param.Add("@suppliername", null, DbType.String);
                param.Add("@memoid", 0);
                param.Add("@PRTypeid", 0);
                param.Add("@Prtype", null, DbType.String);
                param.Add("@user_id", 0);
                var List = await _connection.QueryAsync(PurchaseRequitisionBackEnd.PurchaseRequitionProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();


                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };


            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }

        public async Task<object> GetSupplierAutoComplete(int branchid, int orgid, string suppliername)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 4);
                param.Add("@PRId", 0);
                param.Add("@BranchId", branchid);
                param.Add("@OrgID", orgid);
                param.Add("@RequestorId", 0);
                param.Add("@SupplierId", 0);
                param.Add("@requstorname", null, DbType.String);
                param.Add("@suppliername", suppliername);
                param.Add("@memoid", 0);
                param.Add("@PRTypeid", 0);
                param.Add("@Prtype", null, DbType.String);
                param.Add("@user_id", 0);

                var List = await _connection.QueryAsync(PurchaseRequitisionBackEnd.PurchaseRequitionProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();


                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };


            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }
        public async Task<object> GetSupplierCurrency(int supplierid, int orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 6);
                param.Add("@PRId", 0);
                param.Add("@BranchId", 0);
                param.Add("@OrgID", orgid);
                param.Add("@RequestorId", 0);
                param.Add("@SupplierId", supplierid);
                param.Add("@requstorname", null, DbType.String);
                param.Add("@suppliername", null, DbType.String);
                param.Add("@memoid", 0);
                param.Add("@PRTypeid", 0);
                param.Add("@Prtype", null, DbType.String);
                param.Add("@user_id", 0);

                var List = await _connection.QueryAsync(PurchaseRequitisionBackEnd.PurchaseRequitionProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();


                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };


            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }

        public async Task<object> GetMemoList(int branchid, int orgid,int id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 8);
                param.Add("@PRId", 0);
                param.Add("@BranchId", branchid);
                param.Add("@OrgID", orgid);
                param.Add("@RequestorId", id);
                param.Add("@SupplierId", 0);
                param.Add("@requstorname", null, DbType.String);
                param.Add("@suppliername", null, DbType.String);
                param.Add("@memoid", 0);
                param.Add("@PRTypeid", 0);
                param.Add("@Prtype", null, DbType.String);
                param.Add("@user_id", 0);

                var List = await _connection.QueryAsync(PurchaseRequitisionBackEnd.PurchaseRequitionProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();


                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };


            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }

        public async Task<object> GetMemoItemsList(int branchid, int orgid, int memoid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 7);
                param.Add("@PRId", 0);
                param.Add("@BranchId", branchid);
                param.Add("@OrgID", orgid);
                param.Add("@RequestorId", 0);
                param.Add("@SupplierId", 0);
                param.Add("@requstorname", null, DbType.String);
                param.Add("@suppliername", null, DbType.String);
                param.Add("@memoid", memoid);
                param.Add("@PRTypeid", 0);
                param.Add("@Prtype", null, DbType.String);
                param.Add("@user_id", 0);

                var List = await _connection.QueryAsync(PurchaseRequitisionBackEnd.PurchaseRequitionProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();


                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };


            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }

        }
        public async Task<ResponseModel> UploadDO(int id, string filePath, string fileName)
        {
            try
            {
                string query = @"UPDATE tbl_PurchaseRequisition_Header 
                             SET QuotationFileName = @FileName, 
                                 QuotationFilePath = @FilePath, 
                                 FileUpdatedDate = CURRENT_TIMESTAMP 
                             WHERE PRId = @Id";

                var parameters = new
                {
                    Id = id,
                    FilePath = filePath,
                    FileName = fileName
                };

                int result = await _connection.ExecuteAsync(query, parameters);

                return new ResponseModel
                {
                    Data = null,
                    Message = result > 0 ? "File uploaded successfully." : "No record updated.",
                    Status = result > 0
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Something went wrong.",
                    Status = false
                };
            }
        }



        public async Task<object> UploadDocument(List<RequisitionAttachment> list)
        {
            try
            {

                const string insertDetailSql = @"
            INSERT INTO tbl_purchaserequisition_attachment (
                prid, filename, filepath, createdby, createddate,
                CreatedIP, IsActive
            )
            VALUES (@prId, @FileName, @FilePath, @UserId,now(),'',1);";

                var data = list.Where(x => x.prattachId == 0);
                await _connection.ExecuteAsync(insertDetailSql, data);

                return new SharedModelWithResponse()
                {
                    Data = null,
                    Message = "Success",
                    Status = true
                };

            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }


        }


        public async Task<object> GetPRTypeAutoComplete(int branchid, int orgid, string prtype)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 9);
                param.Add("@PRId", 0);
                param.Add("@BranchId", branchid);
                param.Add("@OrgID", orgid);
                param.Add("@RequestorId", 0);
                param.Add("@SupplierId", 0);
                param.Add("@requstorname", null, DbType.String);
                param.Add("@suppliername",null, DbType.String);
                param.Add("@memoid", 0);
                param.Add("@PRTypeid", 0);
                param.Add("@Prtype", prtype);
                param.Add("@user_id", 0);

                var List = await _connection.QueryAsync(PurchaseRequitisionBackEnd.PurchaseRequitionProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();


                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };


            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }
        public async Task<object> GetProjectsAutoComplete(int branchid, int orgid, string projects)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 10);
                param.Add("@PRId", 0);
                param.Add("@BranchId", branchid);
                param.Add("@OrgID", orgid);
                param.Add("@RequestorId", 0);
                param.Add("@SupplierId", 0);
                param.Add("@requstorname", null, DbType.String);
                param.Add("@suppliername", null, DbType.String);
                param.Add("@memoid", 0);
                param.Add("@PRTypeid", 0);
                param.Add("@Prtype", projects);
                param.Add("@user_id", 0);

                var List = await _connection.QueryAsync(PurchaseRequitisionBackEnd.PurchaseRequitionProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();


                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };


            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }

        public async Task<object> GetSupplierSearchFilter(int branchid, int orgid, string suppliername)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 11);
                param.Add("@PRId", 0);
                param.Add("@BranchId", branchid);
                param.Add("@OrgID", orgid);
                param.Add("@RequestorId", 0);
                param.Add("@SupplierId", 0);
                param.Add("@requstorname", null, DbType.String);
                param.Add("@suppliername", suppliername);
                param.Add("@memoid", 0);
                param.Add("@PRTypeid", 0);
                param.Add("@Prtype", null, DbType.String);
                param.Add("@user_id", 0);

                var List = await _connection.QueryAsync(PurchaseRequitisionBackEnd.PurchaseRequitionProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();


                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };


            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }

        public async Task<object> GetAllPO(int BranchId, int orgid, int PRId)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 12);
                param.Add("@PRId", PRId);
                param.Add("@BranchId", BranchId);
                param.Add("@OrgID", orgid);
                param.Add("@RequestorId", 0);
                param.Add("@SupplierId", 0);
                param.Add("@requstorname", null, DbType.String);
                param.Add("@suppliername", null, DbType.String);
                param.Add("@memoid", 0);
                param.Add("@PRTypeid", 0);
                param.Add("@Prtype", null, DbType.String);
                param.Add("@user_id", 0);

                var List = await _connection.QueryAsync(PurchaseRequitisionBackEnd.PurchaseRequitionProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();


                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };


            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }

         public async Task<object> CancelPRAsync(int prid, int userId, int branchId, int orgId)
        {
            try
            {
                try
                {
                    await _connection.ExecuteAsync("SELECT IsCancel FROM tbl_PurchaseRequisition_Header LIMIT 1");
                }
                catch
                {
                }

                const string getPRStatusSql = @"
                    SELECT 
                        IFNULL(pr_gm_isapproved, 0) AS GMApproved, 
                        IFNULL(pr_gm_isdiscussed, 0) AS GMDiscussed, 
                        IFNULL(pr_director_isapproved, 0) AS DirApproved, 
                        IFNULL(pr_director_isdiscussed, 0) AS DirDiscussed, 
                        IFNULL(IsPOUtil, 0) AS POUtil,
                        IFNULL(IsCancel, 0) AS IsPRCancel
                    FROM tbl_PurchaseRequisition_Header 
                    WHERE PRId = @prid AND BranchId = @branchId AND OrgId = @orgId";

                var prStatus = await _connection.QueryFirstOrDefaultAsync<dynamic>(getPRStatusSql, new { prid, branchId, orgId });
                if (prStatus == null)
                {
                    return new ResponseModel
                    {
                        Status = false,
                        Message = "Purchase Requisition not found."
                    };
                }

                if (Convert.ToInt32(prStatus.IsPRCancel) == 1)
                {
                    return new ResponseModel
                    {
                        Status = false,
                        Message = "Purchase Requisition is already cancelled."
                    };
                }

                bool isGMApprovePending = (Convert.ToInt32(prStatus.GMApproved) == 0 && Convert.ToInt32(prStatus.GMDiscussed) == 0);
                bool isDirApprovePending = (Convert.ToInt32(prStatus.DirApproved) == 0 && Convert.ToInt32(prStatus.DirDiscussed) == 0);
                bool isPONotGenerated = (Convert.ToInt32(prStatus.POUtil) == 0);

                if (!isGMApprovePending || !isDirApprovePending || !isPONotGenerated)
                {
                    return new ResponseModel
                    {
                        Status = false,
                        Message = "PR cannot be cancelled. Only PRs with Pending GM/Director approval and No PO generated can be cancelled."
                    };
                }

                const string cancelPRSql = @"
                    UPDATE tbl_PurchaseRequisition_Header 
                    SET IsCancel = 1, ModifiedDt = NOW(), ModifiedBy = @userId 
                    WHERE PRId = @prid AND BranchId = @branchId AND OrgId = @orgId";

                await _connection.ExecuteAsync(cancelPRSql, new { prid, userId, branchId, orgId });

                const string revertPMSql = @"
                    UPDATE tbl_purchasememo_header AS a 
                    INNER JOIN tbl_PurchaseRequisition_Detail AS b ON a.Memo_ID = b.MEMO_ID AND a.IsActive = 1
                    SET a.IsPrUtil = 0 
                    WHERE b.PRId = @prid AND b.IsActive = 1";

                await _connection.ExecuteAsync(revertPMSql, new { prid });

                return new ResponseModel
                {
                    Status = true,
                    Message = "Purchase Requisition cancelled successfully."
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = "Something went wrong: " + ex.Message
                };
            }
        }
    }
}
