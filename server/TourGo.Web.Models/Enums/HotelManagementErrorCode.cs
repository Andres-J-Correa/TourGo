using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Web.Models.Enums
{
    public enum HotelManagementErrorCode
    {
        HasActiveBooking = BaseErrorCode.HotelManagementError + 1,
    }
}
