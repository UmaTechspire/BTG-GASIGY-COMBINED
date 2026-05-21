using Core.OrderMng.SaleOrder;
using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Wordprocessing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Procurement.PurchaseOrder
{
    public class PurchaseOrder
    {
        public PurchaseOrderHeader Header { get; set; }
        public List<PurchaseOrderDetail> Details { get; set; }

        public List<PurchaseOrderRequisition> Requisition { get; set; }
    }
    public class PurchaseOrderHeader
    {
        public int poid { get; set; }
        public string pono { get; set; }
        public string podate { get; set; }
        public int supplierid { get; set; }
        public int issaved { get; set; }
        public int userid { get; set; }
        public int isactive { get; set; }
        public int branchid { get; set; }
        public int orgid { get; set; }
        public string createdip { get; set; }

        public string modifiedip { get; set; }
        public int requestorid { get; set; }
        public int departmentid { get; set; }
        public int paymenttermid { get; set; }
        public int deliverytermid { get; set; }
        public string remarks { get; set; }
        public int prid { get; set; }
        public int prtypeid { get; set; }
        public string deliveryaddress { get; set; }
        public int currencyid { get; set; }
        public decimal exchangerate { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountValue { get; set; }
        public decimal TaxValue { get; set; }
        public decimal VatValue { get; set; }
        public decimal NetTotal { get; set; }

        public int IsShortClosure { get; set; }
        public int IsShortClosureSubmitted { get; set; }
        public int po_gm_isapproved { get; set; }
        public int po_director_isapproved { get; set; }

    }

    public class PurchaseOrderDetail
    {
        public int podid { get; set; }
        public int poid { get; set; }
        public int prid { get; set; }
        public int isactive { get; set; }
        public int userid { get; set; }
        public string createdip { get; set; }

        public string modifiedip { get; set; }

    }

    public class PurchaseOrderRequisition
    {
        public int porid { get; set; }
        public int podid { get; set; }
        public int poid { get; set; }
        public int prmid { get; set; }
        public int prid { get; set; }
        public int prdid { get; set; }
        public int itemid { get; set; }
        public int uomid { get; set; }
        public decimal qty { get; set; }
        public decimal unitprice { get; set; }
        public decimal totalvalue { get; set; }
        public decimal taxperc { get; set; }
        public decimal taxvalue { get; set; }
        public decimal subtotal { get; set; }
        public decimal discountperc { get; set; }
        public decimal discountvalue { get; set; }
        public decimal nettotal { get; set; }
        public int isactive { get; set; }

        public int userid { get; set; }
        public string createdip { get; set; }

        public string modifiedip { get; set; }

        public decimal vatperc { get; set; }
        public decimal vatvalue { get; set; }
        public Int32 itemgroupid { get; set; }

    }
}