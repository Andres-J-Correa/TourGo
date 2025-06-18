using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Domain.Config.Emails
{
    public class BookingsPublicIdConfig
    {
        public int Length { get; set; }

        public string Characters { get; set; }

        public int NumberOfIdsToGenerate { get; set; }
        public int MaxAttempts { get; set; }
        public string Prefix { get; set; }
    }
}
