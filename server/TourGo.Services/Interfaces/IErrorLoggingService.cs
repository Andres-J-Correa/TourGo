using TourGo.Models.Requests;

namespace TourGo.Services.Interfaces
{
    public interface IErrorLoggingService
    {
        void LogError(ErrorLogRequest request);
    }
}