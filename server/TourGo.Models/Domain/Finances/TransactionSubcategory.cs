using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Domain.Finances
{
    public class TransactionSubcategory : Lookup
    {
        public int CategoryId { get; set; }
    }
}
