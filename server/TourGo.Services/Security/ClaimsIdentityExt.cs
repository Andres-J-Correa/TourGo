using System.Security.Claims;

namespace TourGo.Services.Security
{
    public static class ClaimsIdentityExt
    {
        public static string TENANTID = "TourGo.TenantId";

        public static void AddTenantId(this ClaimsIdentity claims, object tenantId)
        {
            claims.AddClaim(new Claim(TENANTID, tenantId?.ToString(), null, "TourGo"));
        }

        public static bool IsTenantIdClaim(this ClaimsIdentity claims, string claimName)
        {
            return claimName == TENANTID;
        }
    }
}