using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Domain.Finances
{
    public class TransactionVersion: Transaction
    {
        public bool DocumentUrlChanged { get; set; }
    }
}
