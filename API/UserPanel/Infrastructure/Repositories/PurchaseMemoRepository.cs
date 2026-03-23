using BackEnd.Invoices;
using BackEnd.Procurement.PurchaseMemo;
using BackEnd.Shared;
using Core.Abstractions;
using Core.Finance.ClaimAndPayment;
using Core.Models;
using Core.OrderMng.Invoices;
using Core.Procurement.PurchaseMemo;
using Dapper;
using MySqlX.XDevAPI.Common;
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
    public class PurchaseMemoRepository: IPurchaseMemoRepository
    {
        private readonly IDbConnection _connection;        
        string IPAddress = "";
        public PurchaseMemoRepository(IUnitOfWorkDB2 unitOfWork)
        {
            _connection = unitOfWork.Connection;            
        }
        public async Task<object> AddAsync(PurchaseMemo Obj)
        {
            try
            {


                int IsValidated = 0;
                string Message = "";
                Int32 Result = 0;
 
                var response = await GetSeqNumber(0, Obj.Header.PM_Number, 1, Obj.Header.BranchId, Obj.Header.OrgId);
                if (response.Status == true)
                {
                    if (response.Data.result == 1)
                    {
                        IsValidated = 1;
                        Message = " - The current Memo number " + Obj.Header.PM_Number + " is taken for another memo so the new memo number (" + response.Data.text + ") has been generated for this memo";
                        Obj.Header.PM_Number = response.Data.text;
                    }
                }


                const string headerSql = @"
                INSERT INTO `tbl_purchasememo_header`(`isNew`,`hod`,`IsEmailNotification`,`PM_Type`,`PM_Number`,`PMDate`,`RequestorId`,`DeliveryAddress`,`Remarks`,`CreatedBy`,`CreatedDate`,`CreatedIP`,`IsActive`,`IsSubmitted`,`OrgId`,`BranchId`)
                VALUES (@isNew,@hodid,@IsEmailNotification,@PM_Type,@PM_Number, @PMDate, @RequestorId, @DeliveryAddress, @Remarks,   @UserId, NOW(),'',1,@IsSubmitted,@OrgId, @BranchId);
                SELECT LAST_INSERT_ID(); ";
                
                var insertedHeaderId = await _connection.QuerySingleAsync<int>(headerSql, Obj.Header);

                const string detailSql = @"
                                          INSERT INTO `tbl_purchasememo_detail`
                                         (`Memo_ID`, `ItemId`, `DepartmentId`, `UOMId`, `Qty`, `AvailStk`, `DeliveryDate`, `Remarks`,
                                          `CreatedBy`, `CreatedDate`, `CreatedIP`, `IsActive`,`itemGroupId`)
                                          VALUES
                                         (@Memo_ID, @ItemId, @DepartmentId, @UOMId, @Qty, @AvailStk, @DeliveryDate, @Remarks, 
                                         @CreatedBy, NOW(), '', 1,@itemGroupId);
                                          ";

                foreach (var row in Obj.Details)
                {
                    row.Memo_ID = insertedHeaderId;

                    var parameters = new
                    {
                        Memo_ID = row.Memo_ID,
                        ItemId = row.ItemId,
                        DepartmentId = row.DepartmentId,
                        UOMId = row.UOMId,
                        Qty = row.Qty,
                        AvailStk = row.AvailStk,
                        DeliveryDate = row.DeliveryDate,
                        Remarks = "",
                        CreatedBy = Obj.Header.UserId,
                        itemGroupId=row.itemGroupId
                    };

                    await _connection.ExecuteAsync(detailSql, parameters);
                }



                int BranchId = Obj.Header.BranchId;
                var updateSeq = "UPDATE master_documentnumber SET Doc_Number = Doc_Number + 1 WHERE Doc_Type = 1 AND Unit = @BranchId;";
                Result = await _connection.ExecuteAsync(updateSeq, new { BranchId });
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
        public async Task<object> UpdateAsync(PurchaseMemo Obj)
        {
            try
            {
                int Result = 0;
                const string headerSql = @"
            UPDATE tbl_purchasememo_header
            SET 
            IsEmailNotification=@IsEmailNotification,
            PM_Type = @PM_Type,
            RequestorId = @RequestorId,
            DeliveryAddress = @DeliveryAddress,
            Remarks = @Remarks,
            LastModifiedBY = @UserId,
            LastModifiedDate = now(),
            LastMOdifiedIP = '',
            IsSubmitted = @IsSubmitted,
            isNew=@isNew,
            LastModifiedDate = NOW(),
            hod=@hodid 
            WHERE Memo_ID = @Memo_ID;";


                await _connection.ExecuteAsync(headerSql, Obj.Header);

                int HeaderId = Obj.Header.Memo_ID;
                const string deleteDetailsSql = @"UPDATE tbl_purchasememo_detail SET IsActive = 0 WHERE Memo_ID = @Memo_ID;";
                await _connection.ExecuteAsync(deleteDetailsSql, new { Memo_ID = HeaderId });

                string updatesql = "";
                foreach (var row in Obj.Details)
                {
                    
                    if (row.Memo_dtl_ID == 0)
                    {
                        updatesql += @"
                INSERT INTO  `tbl_purchasememo_detail`(`Memo_ID`,`ItemId`,`DepartmentId`,`UOMId`,`Qty`,`AvailStk`,`DeliveryDate`,`Remarks`,`CreatedBy`,`CreatedDate`,`CreatedIP`,`IsActive`,`itemGroupId`)
                select " + row.Memo_ID + "," + row.ItemId + "," + row.DepartmentId + "," + row.UOMId + "," + row.Qty + "," + row.AvailStk + ",'" + row.DeliveryDate + "',''," + Obj.Header.UserId + ",now(),'',1,"+row.itemGroupId + "; ";

                    }
                    else
                    {
                        updatesql += @" update tbl_purchasememo_detail set ItemId="+row.ItemId+ ",DepartmentId="+row.DepartmentId+ ",UOMId="+row.UOMId+ ",DeliveryDate='"+row.DeliveryDate+ "',itemGroupId="+row.itemGroupId+ ",Qty="+row.Qty+", isactive=1 where Memo_dtl_ID=" + row.Memo_dtl_ID + ";";
                        
                    }
                }

                if (Obj.Details.Count > 0)
                {
                    await _connection.ExecuteAsync(updatesql);
                }



                if (Obj.Header.IsSubmitted == 0)
                {
                    return new ResponseModel()
                    {
                        Data = HeaderId,
                        Message = "Purchase Memo updated successfully",
                        Status = true
                    };
                }
                else
                {
                    return new ResponseModel()
                    {
                        Data = HeaderId,
                        Message = "Purchase Memo posted successfully",
                        Status = true
                    };
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
        public async Task<object> GetByIdAsync(int pmid, Int32 OrgId)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 3);
                param.Add("@pmid", pmid);
                param.Add("@branchid", 0);
                param.Add("@orgid", OrgId);
                param.Add("@reqid", 0);
                param.Add("@pmnumber", "");
                param.Add("@user_id", 0);
                using (var List = await _connection.QueryMultipleAsync(PurchaseMemoBackEnd.PurchaseMemoProcedure, param: param, commandType: CommandType.StoredProcedure))
                {


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
                                Modellist.header = new object();
                            }
                            else
                            {
                                Modellist.header = nl[0];
                            }
                        }
                        else if (I == 1)
                        {


                            Modellist.details = nl;
                        }
                        else if (I == 2)
                        {

                            Modellist.attachment = nl;
                        }

                        I++;


                    }

                    //var header = (await List.ReadAsync()).FirstOrDefault() ?? new object();
                    //var details = (await List.ReadAsync()).ToList();
                    //var attachment = (await List.ReadAsync()).ToList();
                    //while (!List.IsConsumed)
                    //{
                    //    await List.ReadAsync();
                    //}

                    return new ResponseModel()
                    {
                        Data = Modellist,
                        Message = "Success",
                        Status = true
                    };
                }


            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong"+Ex.Message,
                    Status = false
                };
            }
        }
        public async Task<object> GetAllAsync(Int32 requesterid,int BranchId, Int32 OrgId, string pmnumber,int userid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 1);
                param.Add("@pmid", 0);
                param.Add("@branchid", BranchId);
                param.Add("@orgid", OrgId);
                param.Add("@reqid", requesterid);
                param.Add("@pmnumber", pmnumber);
                param.Add("@user_id", userid);
                var List = await _connection.QueryAsync(PurchaseMemoBackEnd.PurchaseMemoProcedure, param: param, commandType: CommandType.StoredProcedure);
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
        public async Task<object> GetBySeqNoAsync(int unit, Int32 OrgId)
        {
            try
            {
                var param = new DynamicParameters();       
                param.Add("@opt", 2);
                param.Add("@pmid", 0);
                param.Add("@branchid", unit);
                param.Add("@orgid", OrgId);
                param.Add("@reqid", 0);
                param.Add("@pmnumber", "");
                param.Add("@user_id", 0);

                var data = await _connection.QueryFirstOrDefaultAsync(PurchaseMemoBackEnd.PurchaseMemoProcedure, param: param, commandType: CommandType.StoredProcedure);

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

        public async Task<object> UploadDocument(List<MemoAttachment> list)
        {
            try
            {

                const string insertDetailSql = @"
            INSERT INTO tbl_purchasememo_Attachment (
                Memo_ID, AttachmentName, AttachmentPath, CreatedBy, CreatedDate,
                CreatedIP, IsActive
            )
            VALUES (@MemoId, @FileName, @FilePath, @UserId,now(),'',1);";

                var data = list.Where(x => x.Id == 0);
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


                var data = await _connection.QueryFirstOrDefaultAsync<SharedModel>(Shared.SharedProcedure, param: param, commandType: CommandType.StoredProcedure);



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

        public async Task<object> DeleteMemo(InActiveMemo obj)
        {
            try
            {
                string updateHeaderSql = @"
            UPDATE tbl_purchasememo_header SET isactive=0   WHERE Memo_ID = " + obj.memoId + ";";

                await _connection.ExecuteAsync(updateHeaderSql);



                return new ResponseModel
                {
                    Data = 0,
                    Message = "Deleted Successfully",
                    Status = true
                };
            }
            catch (Exception Ex)
            {
                return new ResponseModel
                {
                    Data = 0,
                    Message = "Something went wrong while deleting Memo. : " + Ex.Message,
                    Status = false
                };
            }
        }

    }
}
