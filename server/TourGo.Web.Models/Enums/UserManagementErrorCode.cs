using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Web.Models.Enums
{
    public enum UserManagementErrorCode
    {
        UserAlreadyExists = BaseErrorCode.UserManagementError + 1,
        EmailAlreadyExists = BaseErrorCode.UserManagementError + 2,
        PhoneAlreadyExists = BaseErrorCode.UserManagementError + 3,
    }

}
