using TourGo.Models.Domain.Staff;
using TourGo.Models.Requests.Staff;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IStaffService
    {
        void AcceptInvite(int inviteId, string userId);
        void RejectInvite(int inviteId, string userId);
        int AddInvite(StaffInvitationRequest model, int hotelId, string userId);
        void DeleteInvite(int inviteId);
        List<StaffInvite>? GetInvitesByEmail(string email);
        List<StaffInvite>? GetInvitesByHotelId(int hotelId);
        List<Staff>? GetByHotelId(int hotelId);
        void RemoveStaff(string userId, int hotelId, string modifiedBy);
        void UpdateStaffRole(string userId, int hotelId, int role, string modifiedBy);
        void LeaveHotel(string userId, int hotelId);
    }
}