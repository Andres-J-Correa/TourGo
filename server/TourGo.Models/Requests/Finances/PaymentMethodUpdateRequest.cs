using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Interfaces;

namespace TourGo.Models.Requests.Finances
{
    public class PaymentMethodUpdateRequest: PaymentMethodAddRequest, IModelIdentifier
    {
        public int Id { get; set; }
    }
}
