using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Domain.Hotels
{
    public class ExtraCharge: AuditableEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public Lookup Type { get; set; } = new Lookup();
        public bool IsActive { get; set; }
    }
}
