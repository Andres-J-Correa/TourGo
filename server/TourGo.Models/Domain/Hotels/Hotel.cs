using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Domain.Users;

namespace TourGo.Models.Domain.Hotels
{
    public class Hotel
    {
        public string Name { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string Email { get; set; }
        public string TaxId { get; set; }
        public DateTime DateCreated { get; set; }
        public UserBase Owner { get; set; }
        public string Id { get; set; } = string.Empty;

    }
}
