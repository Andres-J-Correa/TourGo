using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Attributes;

namespace TourGo.Models.Requests.Staff
{
    public class StaffInvitationRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Range(1, 3)]
        public int RoleId { get; set; }
    }
}
