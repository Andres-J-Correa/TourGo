using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Requests.Invoices
{
    public class InvoiceUpdateRequest : InvoiceAddRequest
    {
        public bool Locked { get; set; }
    }
}
