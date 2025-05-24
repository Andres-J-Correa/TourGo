using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Domain.Customers;
using TourGo.Models.Domain.Finances;

namespace TourGo.Models.Domain
{
    public class EntityBase : AuditableEntity
    {
        public int Id { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Charges { get; set; }
        public decimal Total { get; set; }
        public List<Transaction>? Transactions { get; set; }
        public int InvoiceId { get; set; }
        public Customer? Customer { get; set; }
    }
}
