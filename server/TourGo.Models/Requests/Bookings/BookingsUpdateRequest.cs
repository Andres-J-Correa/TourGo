using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Interfaces;

namespace TourGo.Models.Requests.Bookings
{
    public class BookingsUpdateRequest : BookingAddRequest, IModelIdentifierString
    {
        public string Id { get; set; } = string.Empty;
    }
}
