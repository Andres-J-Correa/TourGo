using Amazon.Runtime;
using Amazon;
using Amazon.S3;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TourGo.Models.Domain.Config;
using Amazon.S3.Transfer;
using Microsoft.AspNetCore.Http;
using TourGo.Services.Interfaces;
using TourGo.Models.Enums;
using Amazon.S3.Model;

namespace TourGo.Services.Files
{
    public class FileService : IFileService
    {
        private readonly ILogger<FileService> _logger;
        private readonly AWSS3Config _awsS3Config;
        private readonly AmazonS3Client _client;

        public FileService(ILogger<FileService> logger, IOptions<AWSS3Config> awsS3Config)
        {
            _logger = logger;
            _awsS3Config = awsS3Config.Value;

            AWSCredentials credentials = new BasicAWSCredentials(_awsS3Config.AccessKey, _awsS3Config.SecretKey);
            _client = new AmazonS3Client(credentials, RegionEndpoint.USEast1);
        }

        public void Upload(IFormFile file, AWSS3BucketEnum bucket, string fileKey)
        {
            TransferUtility transferUtility = new TransferUtility(_client);

            try
            {
                transferUtility.Upload(file.OpenReadStream(), GetBucketName(bucket), fileKey);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<string> GetPresignedUrl (string fileKey, AWSS3BucketEnum bucket)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = GetBucketName(bucket),
                Key = fileKey,
                Expires = DateTime.UtcNow.AddSeconds(_awsS3Config.PresignedUrlExpireInSeconds),
                Protocol = Protocol.HTTPS
            };

            string presignedUrl = await _client.GetPreSignedURLAsync(request);

            return presignedUrl;
        }

        private static string GetBucketName(AWSS3BucketEnum bucket)
        {
            switch (bucket)
            {
                case AWSS3BucketEnum.TransactionsFiles:
                    return "transactions-support-files";
                default:
                    throw new ArgumentOutOfRangeException(nameof(bucket), bucket, null);
            }
        }

    }
}
