using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.Purchase_Memo.UploadDocument;
using Core.Procurement.PurchaseMemo;
using Core.Procurement.PurchaseRequisition;
using MediatR;

namespace Application.Procurement.Purchase_Requitision.RequisitionUploadDocument
{
    public class RequisitionUploadDocumentCommandHandler : IRequestHandler<RequisitionUploadDocumentCommand, object>
    {
        private readonly IPurchaseRequisitionRepository _repository;

        public RequisitionUploadDocumentCommandHandler(IPurchaseRequisitionRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(RequisitionUploadDocumentCommand command, CancellationToken cancellationToken)
        {
            var data = await _repository.UploadDocument(command.attachmentList);
            return data;

        }

    }
}
