using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Enums;

namespace TourGo.Models.Domain.Users
{
    public class UserToken
    {
        public string Token { get; set; }
        public int UserId { get; set; }
        public UserTokenTypeEnum TokenType { get; set; }
        public DateTime Expiration { get; set; }
    }
}
