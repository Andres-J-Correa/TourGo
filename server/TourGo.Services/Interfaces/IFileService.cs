using Microsoft.AspNetCore.Http;
using TourGo.Models.Enums;

namespace TourGo.Services.Interfaces
{
    public interface IFileService
    {
        void Upload(IFormFile file, AWSS3BucketEnum bucket, string fileKey);
        Task<string> GetPresignedUrl(string fileKey, AWSS3BucketEnum bucket);
    }
}