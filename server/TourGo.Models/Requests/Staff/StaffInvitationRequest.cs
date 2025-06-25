using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Attributes;
using TourGo.Models.Enums;

namespace TourGo.Models.Requests.Staff
{
    public class StaffInvitationRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [ValidEnum(typeof(StaffRoleEnum))]
        public int RoleId { get; set; }

        public string? CaptchaToken { get; set; }
    }
}
