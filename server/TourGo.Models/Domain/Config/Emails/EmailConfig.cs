using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Domain.Config.Emails
{
    public class EmailConfig
    {
        public int PasswordResetExpirationHours { get; set; }
        public int EmailVerificationExpirationHours { get; set; }
        public string DomainUrl { get; set; }
    }
}
