using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Domain.Config
{
    public class GoogleRecaptchaConfig
    {
        public string BaseUrl { get; set; }
        public string SecretKey { get; set; }
    }
}
