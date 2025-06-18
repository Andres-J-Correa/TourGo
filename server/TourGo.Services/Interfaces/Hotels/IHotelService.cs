using TourGo.Models.Domain;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Domain.Invoices;
using TourGo.Models.Requests.Finances;
using TourGo.Models.Requests.Hotels;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IHotelService
    {
        int Create(HotelAddRequest model, string userId, string publicId);
        Hotel? GetDetails(string id);
        List<HotelMinimal>? GetUserHotelsMinimal(string userId);
        HotelMinimal? GetMinimal(string id);
        HotelMinimalWithUserRole? GetMinimalWithUserRole(string id, string userId);
        void Update(HotelUpdateRequest model, string userId);
        void Delete(string id, string userId);
        List<RolePermission>? GetRolePermissions();
        List<string>? GetAvailablePublicIds(List<string> possibleIds);
        void InvoicesUpsertDefaultTC(string hotelId, InvoiceDefaultTCAddUpdateRequest model, string userId);
        InvoicesDefaultTC? GetInvoicesDefaultTC(string hotelId);
    }
}