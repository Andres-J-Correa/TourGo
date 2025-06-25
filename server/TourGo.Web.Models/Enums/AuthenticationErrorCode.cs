using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Web.Models.Enums
{
    public enum AuthenticationErrorCode
    {
        UserNotFound = BaseErrorCode.AuthenticationError + 1,
        AccountLocked = BaseErrorCode.AuthenticationError + 2,
        IncorrectCredentials = BaseErrorCode.AuthenticationError + 3,
        TokenNotFound = BaseErrorCode.AuthenticationError + 4,
        Forbidden = BaseErrorCode.AuthenticationError + 5,
        FailedCaptchaVerification = BaseErrorCode.UserManagementError + 6,
        // Add other authentication-related error codes here
    }

}
