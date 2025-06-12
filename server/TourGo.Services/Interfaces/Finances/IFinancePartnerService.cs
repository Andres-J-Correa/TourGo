using TourGo.Models.Domain;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Requests.Finances;

namespace TourGo.Services.Interfaces.Finances
{
    public interface IFinancePartnerService
    {
        int Add(FinancePartnerAddRequest model, string userId, string hotelId);
        void Delete(int id, string userId);
        List<FinancePartner>? Get(string hotelId);
        List<Lookup>? GetMinimal(string hotelId);
        void Update(FinancePartnerUpdateRequest model, string userId);
    }
}