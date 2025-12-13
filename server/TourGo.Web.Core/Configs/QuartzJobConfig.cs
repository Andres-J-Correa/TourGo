using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Web.Core.Configs
{
    public class QuartzJobConfig
    {
        public string Name { get; set; } = string.Empty;
        public string Cron { get; set; } = string.Empty;
        public string Group { get; set; } = "Default";
        public bool Enabled { get; set; } = true;
    }
}
