using Amazon.Auth.AccessControlPolicy;
using System.ComponentModel.DataAnnotations;
using TourGo.Web.Api.Resources;

namespace TourGo.Web.Api.Enums.Staff
{
    public enum StaffRoleEnum
    {
        [Display(Name = "Owner", ResourceType = typeof(Resources.StaffRoleEnum))]
        Owner = 1,

        [Display(Name = "Admin", ResourceType = typeof(Resources.StaffRoleEnum))]
        Admin = 2,

        [Display(Name = "Receptionist", ResourceType = typeof(Resources.StaffRoleEnum))]
        Receptionist = 3,
    }
}
