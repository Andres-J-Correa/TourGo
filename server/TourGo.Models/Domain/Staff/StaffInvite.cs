using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Users;

namespace TourGo.Models.Domain.Staff
{
    public class StaffInvite
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public int Flags { get; set; }
        public DateTime Expiration { get; set; }
        public UserBase IssuedBy { get; set; } = new UserBase();
        public DateTime DateCreated { get; set; }
        public DateTime DateModified { get; set; }
        public Lookup? Hotel { get; set; }
    }
}
