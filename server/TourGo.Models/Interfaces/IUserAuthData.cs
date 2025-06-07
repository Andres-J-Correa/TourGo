using TourGo.Models.Interfaces;

namespace TourGo.Models
{
    public interface IUserAuthData : IUserAuthDataV2
    {
        string FirstName { get; }
        string LastName { get; }
        string Email { get; }
        string Phone { get; }
    }
}