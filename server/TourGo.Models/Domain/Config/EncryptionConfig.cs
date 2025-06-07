using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Domain.Config
{
    public class EncryptionConfig
    {
        public string UserPIIKey { get; set; } = string.Empty;
        public string UserPIICacheVersion { get; set; } = string.Empty;
    }
}
