using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Domain.Bookings;
using TourGo.Models.Interfaces;

namespace TourGo.Models.Domain.Invoices
{
    public class InvoiceWithEntities: Invoice
    {
        public List<Booking>? Bookings { get; set; }

        public InvoiceWithEntities(Invoice invoiceBase)
        {
            Id = invoiceBase.Id;
            InvoiceNumber = invoiceBase.InvoiceNumber;
            ParentId = invoiceBase.ParentId;
            ExternalId = invoiceBase.ExternalId;
            TypeId = invoiceBase.TypeId;
            StatusId = invoiceBase.StatusId;
            Subtotal = invoiceBase.Subtotal;
            Charges = invoiceBase.Charges;
            Paid = invoiceBase.Paid;
            Total = invoiceBase.Total;
            BalanceDue = invoiceBase.BalanceDue;
            Locked = invoiceBase.Locked;
        }

        public InvoiceWithEntities()
        {

        }
    }
}
