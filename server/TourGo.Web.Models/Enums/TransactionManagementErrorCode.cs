using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Web.Models.Enums
{
    public enum TransactionManagementErrorCode
    {
        BadRequest = BaseErrorCode.TransactionManagementError + 1,
        ReferenceNumberConflict = BaseErrorCode.TransactionManagementError + 2,
        AlreadyReversed = BaseErrorCode.TransactionManagementError + 3,
    }
}
