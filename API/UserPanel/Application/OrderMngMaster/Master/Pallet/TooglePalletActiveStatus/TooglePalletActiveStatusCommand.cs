using MediatR;

namespace Application.OrderMngMaster.Master.Pallet.TooglePaletActiveStatus
{
    public class TooglePalletActiveStatusCommand : IRequest<object>
    {
        public int PalletId { get; set; }
        public int OrgId { get; set; }
        public int BranchId { get; set; }
        public bool IsActive { get; set; }
    }
}
