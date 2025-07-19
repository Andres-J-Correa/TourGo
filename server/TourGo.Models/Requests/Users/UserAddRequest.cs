using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Attributes;
using TourGo.Models.Enums;

namespace TourGo.Models.Requests.Users
{
    public class UserAddRequest: PasswordValidateRequest
    {
        [Required, StringLength(50, MinimumLength = 2)]
        public string FirstName { get; set; }

        [Required, StringLength(50, MinimumLength = 2)]
        public string LastName { get; set; }

        [Required, EmailAddress, StringLength(100)]
        public string Email { get; set; }

        [Phone]
        public string? Phone { get; set; }

        [Required, ValidEnum(typeof(AuthProviderEnum))]
        public int AuthProvider { get; set; }

        public string? CaptchaToken { get; set; }
    }
}
