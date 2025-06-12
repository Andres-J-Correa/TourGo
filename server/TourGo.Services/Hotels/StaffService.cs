using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Data;
using TourGo.Data.Providers;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Domain.Staff;
using TourGo.Models.Requests.Staff;
using TourGo.Services.Interfaces.Hotels;

namespace TourGo.Services.Hotels
{
    public class StaffService : IStaffService
    {
        private readonly IMySqlDataProvider _mySqlDataProvider;
        private readonly int _expirationDays;

        public StaffService(IMySqlDataProvider mySqlDataProvider)
        {
            _mySqlDataProvider = mySqlDataProvider;
            _expirationDays = 7;
        }

        public List<Staff>? GetByHotelId(string hotelId)
        {
            List<Staff>? staffList = null;
            string proc = "hotels_staff_select_by_hotel_id_v3";

            _mySqlDataProvider.ExecuteCmd(proc, (coll) =>
            {
                coll.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;
                Staff staff = new Staff
                {
                    Id = reader.GetSafeString(index++),
                    FirstName = reader.GetSafeString(index++),
                    LastName = reader.GetSafeString(index++),
                    Email = reader.GetSafeString(index++),
                    RoleId = reader.GetSafeInt32(index++)
                };
                staffList ??= new List<Staff>();
                staffList.Add(staff);
            });

            return staffList;
        }

        public void RemoveStaff(string userId, string hotelId, string modifiedBy)
        {
            string proc = "hotels_staff_remove_v3";

            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_hotelId", hotelId);
                coll.AddWithValue("p_userId", userId);
                coll.AddWithValue("p_modifiedBy", modifiedBy);
            });
        }

        public void UpdateStaffRole(string userId, string hotelId, int role, string modifiedBy)
        {
            string proc = "hotels_staff_update_role_v3";

            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_hotelId", hotelId);
                coll.AddWithValue("p_userId", userId);
                coll.AddWithValue("p_roleId", role);
                coll.AddWithValue("p_modifiedBy", modifiedBy);
            });
        }

        public int AddInvite(StaffInvitationRequest model, string hotelId, string userId)
        {
            int newId = 0;
            string proc = "hotel_invites_create_v3";

            DateTime expiration = DateTime.UtcNow.AddDays(_expirationDays);

            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_email", model.Email.ToLower());
                coll.AddWithValue("p_hotelId", hotelId);
                coll.AddWithValue("p_roleId", model.RoleId);
                coll.AddWithValue("p_issuedById", userId);
                coll.AddWithValue("p_expiration", expiration);

                MySqlParameter newIdOut = new MySqlParameter("p_newId", MySqlDbType.Int32);
                newIdOut.Direction = ParameterDirection.Output;
                coll.Add(newIdOut);
            }, (returnColl) =>
            {
                newId = Convert.ToInt32(returnColl["p_newId"].Value);
            });

            return newId;
        }

        public void AcceptInvite(int inviteId, string userId)
        {
            string proc = "hotel_invites_accept_v2";

            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_inviteId", inviteId);
                coll.AddWithValue("p_userId", userId);
            });
        }

        public void RejectInvite(int inviteId, string userId)
        {
            string proc = "hotel_invites_reject_v2";

            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_inviteId", inviteId);
                coll.AddWithValue("p_userId", userId);
            });
        }

        public void DeleteInvite(int inviteId)
        {
            string proc = "hotel_invites_delete";

            _mySqlDataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_inviteId", inviteId);
            });
        }

        public void LeaveHotel(string userId, string hotelId)
        {
            string proc = "hotel_users_roles_user_leave_v3";

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_userId", userId);
                param.AddWithValue("p_hotelId", hotelId);
            });
        }

        public List<StaffInvite>? GetInvitesByHotelId(string hotelId)
        {
            List<StaffInvite>? invites = null;
            string proc = "hotel_invites_select_by_hotel_id_v3";

            _mySqlDataProvider.ExecuteCmd(proc, (coll) =>
            {
                coll.AddWithValue("p_hotelId", hotelId);
            }, (reader, set) =>
            {
                int index = 0;
                StaffInvite invite = MapStaffInvite(reader, ref index);

                invites ??= new List<StaffInvite>();
                invites.Add(invite);
            });

            return invites;
        }

        public List<StaffInvite>? GetInvitesByEmail(string email)
        {

            List<StaffInvite>? invites = null;
            string proc = "hotel_invites_select_by_email_v3";

            _mySqlDataProvider.ExecuteCmd(proc, (coll) =>
            {
                coll.AddWithValue("p_email", email);
            }, (reader, set) =>
            {
                int index = 0;
                StaffInvite invite = MapStaffInvite(reader, ref index);
                invite.Hotel = new HotelMinimal()
                {
                    Id = reader.GetSafeString(index++),
                    Name = reader.GetSafeString(index++)
                };

                invites ??= new List<StaffInvite>();
                invites.Add(invite);
            });

            return invites;
        }

        private static StaffInvite MapStaffInvite(IDataReader reader, ref int index)
        {
            StaffInvite invite = new StaffInvite();
            invite.Id = reader.GetSafeInt32(index++);
            invite.RoleId = reader.GetSafeInt32(index++);
            invite.Expiration = reader.GetSafeDateTime(index++);
            invite.Email = reader.GetSafeString(index++);
            invite.Flags = reader.GetSafeInt32(index++);
            invite.IssuedBy.Id = reader.GetSafeString(index++);
            invite.IssuedBy.FirstName = reader.GetSafeString(index++);
            invite.IssuedBy.LastName = reader.GetSafeString(index++);
            invite.DateCreated = reader.GetSafeDateTime(index++);
            invite.DateModified = reader.GetSafeDateTime(index++);
            return invite;
        }
    }
}
