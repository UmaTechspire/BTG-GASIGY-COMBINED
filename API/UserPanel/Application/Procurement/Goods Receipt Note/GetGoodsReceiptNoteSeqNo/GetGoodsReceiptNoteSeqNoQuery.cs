using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Goods_Receipt_Note.GetGoodsReceiptNoteSeqNo
{
    public class GetGoodsReceiptNoteSeqNoQuery : IRequest<object>
    {
        public int Opt { get; set; }
        public int poid { get; set; }
        public int? supplierid { get; set; }
        public int branchid { get; set; }
        public int orgid { get; set; }
        public int grnid { get; set; }

    }
}
