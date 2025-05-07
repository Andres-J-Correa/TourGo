using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Domain.Config
{
    public class AWSS3Config
    {
        public string AccessKey { get; set; }
        public string SecretKey { get; set; }
        public int PresignedUrlExpireInSeconds { get; set; }
    }
}
