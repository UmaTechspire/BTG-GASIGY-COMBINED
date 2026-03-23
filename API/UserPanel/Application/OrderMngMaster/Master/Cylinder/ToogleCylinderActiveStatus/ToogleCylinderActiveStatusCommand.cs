using MediatR;

namespace Application.OrderMngMaster.Master.Cylinder.ToogleCylinderActiveStatus
{
    public class ToogleCylinderActiveStatusCommand : IRequest<object>
    {
        public int Id { get; set; }

        public bool IsActive { get; set; }
    }
}
