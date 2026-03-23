using BackEnd.ProductionOrder;
using Core.Abstractions;
using Core.Models;
using Core.OrderMng.ProductionOrder;
 
using Dapper;
using Mysqlx.Crud;
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
    public class ProductionRepository : IProductionRepository
    {

        private readonly IDbConnection _connection;
        string IPAddress = "";
       
        public ProductionRepository(IUnitOfWorkDB1 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }
        public async Task<object> AddAsync(ProductionItems Obj)
        {
            try
            {
                int IsValidated = 0;
                string Message = "";
                Int32 Result = 0;
                SharedRepository SR = new SharedRepository(_connection);

                var response=await SR.GetSeqNumber(0, Obj.Header.ProdNo, 3, Obj.Header.BranchId, Obj.Header.OrgId);
                if (response.Status==true)
                {
                    if (response.Data.result == 1)
                    {
                        IsValidated = 1;
                        Message = " - The current order number " + Obj.Header.ProdNo + " is taken for another order so the new order number ("+response.Data.text+") has been generated for this order";
                        Obj.Header.ProdNo = response.Data.text;
                    }
                }

                const string headerSql = @"
            INSERT INTO tbl_productionorder_header(ProdNo,GasTypeId,GasCodeId,CreatedDate,CreatedIP,IsActive,IsSubmitted,CreatedBy,BranchId,OrgId,ProdDate)
            VALUES 
            (@ProdNo, @GasTypeId, @GasCodeId,  now(), '',1,@IsSubmitted, @UserId,@BranchId, @OrgId,@ProdDate);";

                await _connection.ExecuteAsync(headerSql, Obj.Header);

                const string getLastInsertedIdSql = "SELECT LAST_INSERT_ID();";
                var insertedHeaderId = await _connection.QuerySingleAsync<int>(getLastInsertedIdSql);

                Result = insertedHeaderId;

                foreach (var row in Obj.Details)
                {
                    row.Prod_ID = insertedHeaderId;
                    const string detailsql = @"INSERT INTO tbl_productionorder_details(Prod_ID,CylinderId,CylinderName,OwnershipId,GasCodeId,CylinderTypeId,TestedOn,NextTestDate,IsActive)
                VALUES 
                ( @Prod_ID  , @cylinderid, @cylindername, @ownershipid, @gascodeid, @cylindertypeid, @testedon, @nexttestdate, 1);";
                    Result = await _connection.ExecuteAsync(detailsql, row);



                     
                    var UpdateCylinder = "update master_cylinder set statusid=1 where cylinderid=" + row.cylinderid;
                    Result = await _connection.ExecuteAsync(UpdateCylinder);

                }
                    int BranchId = Obj.Header.BranchId;
                    var UpdateSeq = "update master_documentnumber set Doc_Number= Doc_Number + 1 where Doc_Type= 3 and unit= @BranchId;";
                    Result = await _connection.ExecuteAsync(UpdateSeq, new { BranchId });
                
                if (Result == 0)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Saved failed",
                        Status = false
                    };
                }
                else
                {
                    if (Obj.Header.IsSubmitted == 0)
                    {
                        return new ResponseModel()
                        {
                            Data = null,
                            Message = "Saved Successfully"+ Message,
                            Status = true
                        };
                    }
                    else
                    {
                        return new ResponseModel()
                        {
                            Data = null,
                            Message = "Posted Successfully"+ Message,
                            Status = true
                        };
                    }
                }
            }
            catch (Exception Ex)
            {
                //Logger.Instance.Error("Exception:", Ex);
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }

        }


        public async Task<object> UpdateAsync(ProductionItems obj)
        {
            try
            {
                Int32 Result = 0;
                const string headerSql = @"
        UPDATE tbl_productionorder_header
        SET
            GasTypeId = @GasTypeId,
            GasCodeId = @GasCodeId,
            ProdDate = @ProdDate,                     
            LastModifiedBY = @UserId,
            LastModifiedDate = now(),
            LastMOdifiedIP ='',
            IsSubmitted=@IsSubmitted
            where Prod_ID =@Prod_ID;
            ";


                await _connection.ExecuteAsync(headerSql, obj.Header);

                int HeaderId = obj.Header.Prod_ID;
                var UpdateSeq = "update tbl_productionorder_details set isactive=0 where Prod_ID=" + HeaderId;
                Result = await _connection.ExecuteAsync(UpdateSeq, HeaderId);


                const string detailSql = @"
                UPDATE tbl_productionorder_details
                SET
                CylinderId = @cylinderid,
                CylinderName = @cylindername,
                OwnershipId = @ownershipid,
                GasCodeId = @gascodeid,
                CylinderTypeId = @cylindertypeid,
                TestedOn = @testedon,
                NextTestDate = @nexttestdate,
                IsActive = 1
                 
                WHERE Prod_dtl_Id = @Prod_dtl_Id ;";


                const string Insertsql = @"INSERT INTO tbl_productionorder_details(Prod_ID, CylinderId, CylinderName, OwnershipId, GasCodeId, CylinderTypeId, TestedOn, NextTestDate, IsActive)
                VALUES
                (@Prod_ID, @cylinderid, @cylindername, @ownershipid, @gascodeid, @cylindertypeid, @testedon, @nexttestdate, 1); ";

                foreach (var row in obj.Details)
                {
                    //row.SQ_ID = header.Id;
                    if (row.Prod_dtl_Id > 0)
                    {
                        await _connection.ExecuteAsync(detailSql, row);
                    }
                    else if (row.Prod_dtl_Id == 0)
                    {
                        row.Prod_ID = HeaderId;
                        await _connection.ExecuteAsync(Insertsql, row);
                    }

                    

                Result = 1;


                  
                }

                const string updateCylinderSql = @"
        UPDATE master_cylinder AS mc
        INNER JOIN tbl_productionorder_details AS d
            ON mc.CylinderId = d.CylinderId
        SET mc.StatusId = 1
        WHERE d.Prod_ID = @Prod_ID AND d.IsActive = 1 AND d.CylinderId = @CylinderId;
        ";

                foreach (var row in obj.Details)
                {
                    if (row.cylinderid > 0)
                    {
                        await _connection.ExecuteAsync(updateCylinderSql, new
                        {
                            Prod_ID = HeaderId,
                            CylinderId = row.cylinderid
                        });
                    }
                }

                //var UpdateCylinder = "UPDATE master_cylinder AS b INNER JOIN tbl_productionorder_details AS g ON g.isactive=0  and g.prod_id=" + obj.Header.Prod_ID + " and b.cylinderid = g.CylinderId SET b.statusid = 1;";
                //Result = await _connection.ExecuteAsync(UpdateCylinder);
                //Result = 1;

                if (Result == 0)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "",
                        Status = false
                    };
                }
                else
                {
                    if (obj.Header.IsSubmitted == 0)
                    {
                        return new ResponseModel()
                        {
                            Data = null,
                            Message = "Update Successfully",
                            Status = true
                        };
                    }
                    else
                    {
                        return new ResponseModel()
                        {
                            Data = null,
                            Message = "Posted Successfully",
                            Status = true
                        };
                    }


                }

            }
            catch (Exception Ex)
            {
                //  Logger.Instance.Error("Exception:", Ex);
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }



        }







        public async Task<object> GetAllAsync(Int32 ProdId, string from_date, string to_date, Int32 BranchId)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@Opt", 2);
                param.Add("@ProdId", ProdId);
                param.Add("@orgid", 0);
                param.Add("@branchid", BranchId);                
                param.Add("@from_date", from_date);
                param.Add("@to_date", to_date);



                var List = await _connection.QueryAsync(ProductionOrder.ProductionProcedure, param: param, commandType: CommandType.StoredProcedure);
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



        public async Task<object> GetByIdAsync(int Id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@Opt", 1);
                param.Add("@ProdId", Id);
                param.Add("@orgid", 0);
                param.Add("@branchid", 0);
                param.Add("@from_date", "");
                param.Add("@to_date", "");




                var List = await _connection.QueryMultipleAsync(ProductionOrder.ProductionProcedure, param: param, commandType: CommandType.StoredProcedure);

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


                        Modellist.Detail = nl;
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







        public async Task<object> GetByProductionOrderNoAsync(int unit)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@Opt", 3);
                param.Add("@ProdId", 0);
                param.Add("@orgid", 0);
                param.Add("@branchid", unit);
                param.Add("@from_date", "");
                param.Add("@to_date", "");

                var data = await _connection.QueryFirstOrDefaultAsync(ProductionOrder.ProductionProcedure, param: param, commandType: CommandType.StoredProcedure);



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
    }
      
}
