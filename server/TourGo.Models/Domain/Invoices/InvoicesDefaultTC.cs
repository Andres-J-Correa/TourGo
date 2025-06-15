using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Domain.Invoices
{
    public class InvoicesDefaultTC : AuditableEntity
    {
        public string Terms { get; set; } = string.Empty;
    }
}
