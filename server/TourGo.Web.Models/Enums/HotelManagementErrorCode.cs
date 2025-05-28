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
        IsLocked = BaseErrorCode.HotelManagementError + 2,
        Conflicts = BaseErrorCode.HotelManagementError + 3,
        NoRecordsFound = BaseErrorCode.HotelManagementError + 4,
        InsufficientPermissions = BaseErrorCode.HotelManagementError + 5,
    }
}
