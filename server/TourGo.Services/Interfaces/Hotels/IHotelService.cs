using TourGo.Models.Domain;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Finances;
using TourGo.Models.Requests.Hotels;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IHotelService
    {
        int Create(HotelAddRequest model, string userId);
        Hotel? GetDetails(int id);
        List<Lookup>? GetUserHotelsMinimal(string userId);
        Lookup? GetMinimal(int id);
        Lookup? GetMinimalByTransactionId(int txnId);
        HotelMinimalWithUserRole? GetMinimalWithUserRole(int id, string userId);
        void Update(HotelUpdateRequest model, string userId);
        void Delete(int id, string userId);
        List<RolePermission>? GetRolePermissions();
    }
}