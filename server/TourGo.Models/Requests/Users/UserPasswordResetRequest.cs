using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Models.Requests.Users
{
    public class UserPasswordResetRequest : PasswordValidateRequest
    {
        [Required, MinLength(5)]
        public string Token { get; set; }

        [Required, EmailAddress, StringLength(100)]
        public string Email { get; set; }
    }
}
