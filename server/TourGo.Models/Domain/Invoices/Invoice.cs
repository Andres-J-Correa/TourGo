using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Domain.Customers;
using TourGo.Models.Domain.Users;
using TourGo.Models.Interfaces;

namespace TourGo.Models.Domain.Invoices
{
    public class Invoice : AuditableEntity
    {
        public string Id { get; set; } = string.Empty;
        public Customer Customer { get; set; } = new Customer();
        public string ? ParentId { get; set; }
        public string? ExternalId { get; set; }
        public int TypeId { get; set; }
        public int StatusId { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Charges { get; set; }
        public decimal Paid { get; set; }
        public decimal Total { get; set; }
        public decimal BalanceDue { get; set; }
        public bool Locked { get; set; }
        public string? Terms { get; set; }
    }
}
