using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Responses
{
    public class RecaptchaVerifyResponse
    {
        public bool Success { get; set; }
        public string Challenge_ts { get; set; }
        public string Hostname { get; set; }
        public string[] ErrorCodes { get; set; }
    }
}
