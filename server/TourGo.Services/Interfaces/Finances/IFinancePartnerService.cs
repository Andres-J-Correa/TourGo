using TourGo.Models.Domain;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Requests.Finances;

namespace TourGo.Services.Interfaces.Finances
{
    public interface IFinancePartnerService
    {
        int Add(FinancePartnerAddUpdateRequest model, string userId);
        void Delete(int id, string userId);
        List<FinancePartner>? Get(int hotelId);
        List<Lookup>? GetMinimal(int hotelId);
        void Update(FinancePartnerAddUpdateRequest model, string userId);
    }
}