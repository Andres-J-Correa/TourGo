using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Requests.Users
{
    public class UserValidateRequest
    {
        [Required, EmailAddress, StringLength(100)]
        public string Email { get; set; }
    }
}
