using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Interfaces;

namespace TourGo.Models.Requests.Customers
{
    public class CustomerUpdateRequest: CustomerAddRequest, IModelIdentifier
    {
        public int Id { get; set; }
    }
}
