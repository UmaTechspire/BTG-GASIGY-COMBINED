using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Abstractions;
using Core.OrderMng.Invoices;
using Core.Procurement.PurchaseMemo;
using MediatR;
using UserPanel.Core.Abstractions;

namespace Application.Procurement.Purchase_Memo.UpdatePurchaseMemoItem
{
    public class UpdatePurchaseMemoItemCommandHandler : IRequestHandler<UpdatePurchaseMemoItemCommand, object>
    {

        private readonly IPurchaseMemoRepository _repository;

        private readonly IUnitOfWorkDB2 _unitOfWork;



        public UpdatePurchaseMemoItemCommandHandler(IPurchaseMemoRepository repository, IUnitOfWorkDB2 unitOfWork)
        {



            _repository = repository;
            _unitOfWork = unitOfWork;

        }
        public async Task<object> Handle(UpdatePurchaseMemoItemCommand command, CancellationToken cancellationToken)
        {
            PurchaseMemo Items = new PurchaseMemo();
            Items.Header = command.Header;
            Items.Details = command.Details;
             
            var data = await _repository.UpdateAsync(Items);
            _unitOfWork.Commit();

            return data;


        }


    }
}

