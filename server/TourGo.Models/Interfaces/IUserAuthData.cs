namespace TourGo.Models
{
    public interface IUserAuthData
    {
        int Id { get; }
        string FirstName { get; }
        string LastName { get; }
        IEnumerable<string> Roles { get; }
    }
}