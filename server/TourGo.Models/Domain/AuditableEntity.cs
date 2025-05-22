using System;
using System.Collections.Generic;
using System.Data;
using TourGo.Data;
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

        public void MapFromReader(IDataReader reader, ref int index)
        {
            CreatedBy.Id = reader.GetSafeInt32(index++);
            CreatedBy.FirstName = reader.GetSafeString(index++);
            CreatedBy.LastName = reader.GetSafeString(index++);
            ModifiedBy.Id = reader.GetSafeInt32(index++);
            ModifiedBy.FirstName = reader.GetSafeString(index++);
            ModifiedBy.LastName = reader.GetSafeString(index++);
            DateCreated = reader.GetSafeDateTime(index++);
            DateModified = reader.GetSafeDateTime(index++);
        }
    }
}
