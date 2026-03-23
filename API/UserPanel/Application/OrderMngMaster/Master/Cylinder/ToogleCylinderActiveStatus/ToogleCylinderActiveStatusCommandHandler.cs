using Core.Master.Cylinder;
using MediatR;

namespace Application.OrderMngMaster.Master.Cylinder.ToogleCylinderActiveStatus
{
    public class ToogleCylinderActiveStatusCommandHandler : IRequestHandler<ToogleCylinderActiveStatusCommand, object>
    {
        private readonly IMasterCylinderRepository _repository;

        public ToogleCylinderActiveStatusCommandHandler(IMasterCylinderRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(ToogleCylinderActiveStatusCommand request, CancellationToken cancellationToken)
        {
            MasterCylinder cylinder = new MasterCylinder();
            cylinder.Cylinderid = request.Id;
            cylinder.IsActive = request.IsActive;

            var data = await _repository.ToogleStatus(cylinder);
            return data;
        }
    }
}
