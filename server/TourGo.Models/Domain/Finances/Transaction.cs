using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Domain.Users;

namespace TourGo.Models.Domain.Finances
{
    public class Transaction
    {
		public int Id { get; set; }
        public int? ParentId { get; set; }
        public decimal Amount { get; set; }
        public DateTime TransactionDate { get; set; }
        public DateTime DateCreated { get; set; }
        public UserBase? CreatedBy { get; set; }
        public Lookup? PaymentMethod { get; set; }
        public Lookup? Category { get; set; }
        public Lookup? Subcategory { get; set; }
        public string? ReferenceNumber { get; set; }
        public Lookup? Status { get; set; }
        public string? Description { get; set; }
        public UserBase? ApprovedBy { get; set; }
        public string? CurrencyCode { get; set;}
        public int HotelId { get ;set;}
        public Lookup? FinancePartner{get ;set;}
        public int EntityId { get; set; } 
        public bool HasDocumentUrl { get; set; }

    }
}
