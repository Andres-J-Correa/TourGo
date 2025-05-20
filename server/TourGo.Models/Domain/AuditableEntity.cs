using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Domain.Users;

namespace TourGo.Models.Domain
{
    public class AuditableEntity
    {
        public DateTime DateCreated { get; set; }
        public DateTime DateModified { get; set; }
        public UserBase CreatedBy { get; set; } = new UserBase();
        public UserBase ModifiedBy { get; set; } = new UserBase();
    }
}
