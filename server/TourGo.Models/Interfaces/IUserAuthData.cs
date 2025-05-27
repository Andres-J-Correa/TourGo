namespace TourGo.Models
{
    public interface IUserAuthData
    {
        int Id { get; }
        string? FirstName { get; }
        string? LastName { get; }
        string? Email { get; }
        IEnumerable<string> Roles { get; }
        bool? IsVerified { get; }
    }
}