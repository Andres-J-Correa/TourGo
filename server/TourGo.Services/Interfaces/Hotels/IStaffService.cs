using TourGo.Models.Domain.Staff;
using TourGo.Models.Requests.Staff;

namespace TourGo.Services.Interfaces.Hotels
{
    public interface IStaffService
    {
        void AcceptInvite(int inviteId, string userId);
        void RejectInvite(int inviteId, string userId);
        int AddInvite(StaffInvitationRequest model, string hotelId, string userId);
        void DeleteInvite(int inviteId);
        List<StaffInvite>? GetInvitesByEmail(string email);
        List<StaffInvite>? GetInvitesByHotelId(string hotelId);
        List<Staff>? GetByHotelId(string hotelId);
        void RemoveStaff(string userId, string hotelId, string modifiedBy);
        void UpdateStaffRole(string userId, string hotelId, int role, string modifiedBy);
        void LeaveHotel(string userId, string hotelId);
    }
}