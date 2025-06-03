using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Enums.Transactions
{
    public enum TransactionStatusEnum
    {
        Pending = 1,
        Completed = 2,
        Failed = 3,
        Reversed = 5,
    }
}
