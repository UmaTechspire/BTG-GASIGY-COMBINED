using DocumentFormat.OpenXml.VariantTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Procurement.PurchaseRequisition
{
    public class PurchaseRequisition
    {
        public PurchaseRequisitionHeader Header { get; set; }
        public List<PurchaseRequisitionDetail> Details { get; set; }

    }

    public class PurchaseRequisitionHeader
    {
        public Int32 PRId { get; set; }
        public string PR_Number { get; set; }
        public string PRDate { get; set; }
        public Int32 PRTypeId { get; set; }
        public Int32 ProjectId { get; set; }
        public Int32 SupplierId { get; set; }
        public Int32 RequestorId { get; set; }
        public Int32 DeptId { get; set; }

        public Int32 PaymentTermId { get; set; }
        public string? DeliveryTerm { get; set; }
        public string BTGDeliveryAddress { get; set; }
        public string Remarks { get; set; }
        public string QuotationFileName { get; set; }
        public string QuotationFilePath { get; set; }
        public string FileUpdatedDate { get; set; }
        public Int32 IsSubmitted { get; set; }

        public Int32 userid { get; set; }
        public string CreatedIP { get; set; }

        public string ModifiedIP { get; set; }
        public Int32 IsActive { get; set; }
        public Int32 OrgId { get; set; }
        public Int32 BranchId { get; set; }
        public int currencyid { get; set; }
        public decimal exchangerate { get; set; }
        public string? prTypeName { get; set; }
        public string? PaymentTermName { get; set; }
        public int deliveryTermId {get;set;}
        public string Memoremarks { get; set; }
        public string poreference { get; set; }
        public int po_ref_id { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountValue { get; set; }
        public decimal TaxValue { get; set; }
        public decimal VatValue { get; set; }
        public decimal NetTotal { get; set; }


    }

    public class PurchaseRequisitionDetail
    {
        public decimal vatPerc { get; set; }
        public decimal vatValue { get; set; }
        public Int32 taxcalctype { get; set; }

        public Int32 PRDId { get; set; }
        public Int32 PRId { get; set; }
        public Int32? MEMO_ID { get; set; }
        public Int32 MEMO_dtl_Id { get; set; }
        public Int32 ItemId { get; set; }
        public Int32 DeptId { get; set; }
        public Int32 UOM { get; set; }
        public decimal Qty { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalValue { get; set; }
        public decimal TaxPerc { get; set; }
        public decimal TaxValue { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountPerc { get; set; }
        public decimal DiscountValue { get; set; }
        public decimal NetTotal { get; set; }
        public Int32 IsActive { get; set; }        
        public Int32 userid { get; set; }
        public string CreatedIP { get; set; }     
        
        public string ModifiedIP { get; set; }

        public Int32 ItemGroupId { get; set; }

        public Int32 taxid { get; set; }
        public Int32 vatid { get; set; }

    }
    

}
