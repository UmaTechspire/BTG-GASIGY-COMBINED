using Core.Master.Cylinder;
using MediatR;

namespace Application.OrderMngMaster.Master.Cylinder.GetAllCynlinderListing
{
    public class GetAllCylinderListingQueryHandler : IRequestHandler<GetAllCylinderListingQuery, object>
    {
        private readonly IMasterCylinderRepository _repository;

        public GetAllCylinderListingQueryHandler(IMasterCylinderRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetAllCylinderListingQuery request, CancellationToken cancellationToken)
        {
            var cylinderName = request.CylinderName.Length == 2 ? request.CylinderName.Replace("\"", "") : request.CylinderName;
            return await _repository.GetAllAsync(cylinderName, request.FromDate, request.ToDate);
        }
    }
}
