using Application.OrderMngMaster.Master.Pallet.TooglePaletActiveStatus;
using Core.Master.Pallet;
using MediatR;

namespace Application.OrderMngMaster.Master.Pallet.TooglePalletActiveStatus
{
    public class ToogleGasActiveStatusCommandHandler : IRequestHandler<TooglePalletActiveStatusCommand, object>
    {
        private readonly IMasterPalletRepository _repository;

        public ToogleGasActiveStatusCommandHandler(IMasterPalletRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(TooglePalletActiveStatusCommand request, CancellationToken cancellationToken)
        {
            MasterPallet pallet = new MasterPallet();
            pallet.PalletId = request.PalletId;
            pallet.IsActive = request.IsActive;
            pallet.OrgId = request.OrgId;
            pallet.BranchId = request.BranchId;

            var data = await _repository.ToogleStatus(pallet);
            return data;
        }
    }
}
