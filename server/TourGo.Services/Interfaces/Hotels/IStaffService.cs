using TourGo.Models.Domain.Staff;
using TourGo.Models.Requests.Staff;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IStaffService
    {
        void AcceptInvite(int inviteId, int userId);
        void RejectInvite(int inviteId, int userId);
        int AddInvite(StaffInvitationRequest model, int hotelId, int userId);
        void DeleteInvite(int inviteId);
        List<StaffInvite>? GetInvitesByEmail(string email);
        List<StaffInvite>? GetInvitesByHotelId(int hotelId);
        List<Staff>? GetByHotelId(int hotelId);
        void RemoveStaff(int userId, int hotelId, int modifiedBy);
        void UpdateStaffRole(int userId, int hotelId, int role, int modifiedBy);
    }
}