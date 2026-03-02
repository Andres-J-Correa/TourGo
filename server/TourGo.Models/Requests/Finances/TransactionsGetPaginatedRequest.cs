using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Requests.Finances
{
    public class TransactionsGetPaginatedRequest
    {
        public List<int>? CategoryIds { get; set; }
        public List<int>? SubcategoryIds { get; set; }
        public List<int>? StatusIds { get; set; }
        public List<int>? PaymentMethodIds { get; set; }
        public List<int>? FinancePartnerIds { get; set; }
    }
}
