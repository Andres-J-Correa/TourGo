namespace TourGo.Services
{
    public interface IIdentityProvider<T>
    {
        T GetCurrentUserId();
    }
}