using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using MySql.Data.MySqlClient;
using TourGo.Models;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Config;
using TourGo.Models.Domain.Config.Emails;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Enums;
using TourGo.Models.Enums.Transactions;
using TourGo.Models.Requests;
using TourGo.Models.Requests.Finances;
using TourGo.Services;
using TourGo.Services.Hotels;
using TourGo.Services.Interfaces;
using TourGo.Services.Interfaces.Hotels;
using TourGo.Services.Security;
using TourGo.Web.Api.Extensions;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Enums;
using TourGo.Web.Models.Responses;

namespace TourGo.Web.Api.Controllers.Finances
{
    [Route("api/hotel/{hotelId}/transactions")]
    [ApiController]
    public class TransactionsController : BaseApiController
    {
        private readonly ITransactionService _transactionService;
        private readonly IWebAuthenticationService<string> _webAuthService;
        private readonly IErrorLoggingService _errorLoggingService;
        private readonly IFileService _fileService;
        private readonly IMemoryCache _cache;
        private readonly TransactionsPublicIdConfig _publicIdConfig;

        public TransactionsController(ILogger<TransactionsController> logger, 
            ITransactionService transactionService, 
            IWebAuthenticationService<string> webAuthenticationService,
            IErrorLoggingService errorLoggingService,
            IFileService fileService,
            IMemoryCache memoryCache,
            IOptions<TransactionsPublicIdConfig> publicIdOptions) : base(logger)
        {
            _transactionService = transactionService;
            _webAuthService = webAuthenticationService;
            _errorLoggingService = errorLoggingService;
            _fileService = fileService;
            _cache = memoryCache;
            _publicIdConfig = publicIdOptions.Value;
        }

        [HttpPost]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<string>> Add(TransactionAddRequest model, string hotelId)
        {
            ObjectResult result = null;

            try
            {
                string? publicId = null;
                int attemptsMade = 0;

                do
                {
                    List<string> possiblePublicIds = PublicIdGeneratorService.GenerateSecureIds(_publicIdConfig.NumberOfIdsToGenerate,
                                                                                                _publicIdConfig.Length,
                                                                                                _publicIdConfig.Characters);

                    List<string>? availablePublicIds = _transactionService.GetAvailablePublicIds(possiblePublicIds);

                    if (availablePublicIds != null && availablePublicIds.Count > 0)
                    {
                        publicId = availablePublicIds[0];
                    }

                    attemptsMade++;
                } while (publicId == null && attemptsMade < _publicIdConfig.MaxAttempts);

                if (publicId == null)
                {
                    throw new Exception("Failed to generate a unique public ID after maximum attempts.");
                }

                string userId = _webAuthService.GetCurrentUserId();
                int id = _transactionService.Add(model, userId, hotelId, publicId);

                if(id == 0)
                {
                    throw new Exception("Transaction not created");
                }

                ItemResponse<string> response = new ItemResponse<string> { Item = publicId };
                result = Created201(response);
            }
            catch (MySqlException dbEx)
            {
                ErrorResponse error;

                if (Enum.IsDefined(typeof(TransactionManagementErrorCode), dbEx.Number))
                {
                    error = new ErrorResponse((TransactionManagementErrorCode)dbEx.Number);
                }
                else
                {
                    error = new ErrorResponse();
                    Logger.LogErrorWithDb(dbEx, _errorLoggingService, HttpContext);
                }
                result = StatusCode(500, error);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }

            return result ;
        }

        [HttpPut("{id}")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> Update(TransactionUpdateRequest model, string hotelId)
        {
            ObjectResult result = null;
            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _transactionService.Update(model, userId, hotelId);
                SuccessResponse response = new SuccessResponse();
                result = Ok200(response);
            }
            catch (MySqlException dbEx)
            {
                ErrorResponse error;
                if (Enum.IsDefined(typeof(TransactionManagementErrorCode), dbEx.Number))
                {
                    error = new ErrorResponse((TransactionManagementErrorCode)dbEx.Number);
                }
                else
                {
                    error = new ErrorResponse();
                    Logger.LogErrorWithDb(dbEx, _errorLoggingService, HttpContext);
                }
                result = StatusCode(500, error);
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }
            return result;
        }

        [HttpPatch("{id}/description")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> UpdateDescription(TransactionDescriptionUpdateRequest model)
        {
            ObjectResult result = null;
            try
            {
                _transactionService.UpdateDescription(model);
                SuccessResponse response = new SuccessResponse();
                result = Ok200(response);
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }
            return result;
        }

        [HttpPost("{id}/document-url")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Create)]
        public ActionResult<SuccessResponse> UpdateDocumentUrl([FromForm] TransactionFileAddRequest model, string hotelId)
        {
            ObjectResult result = null;

            try
            {
                if (model.File.Length == 0)
                {
                    return BadRequest("File is empty");
                }

                string fileKey = _transactionService.GetFileKey(model, hotelId);
                string userId = _webAuthService.GetCurrentUserId();

                _fileService.Upload(model.File, AWSS3BucketEnum.TransactionsFiles, fileKey);
                _transactionService.UpdateDocumentUrl(model.Id, fileKey, userId);

                SuccessResponse response = new SuccessResponse();
                result = Ok200(response);
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpPut("{id}/reverse")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Update)]
        public ActionResult<ItemResponse<string>> Reverse(string id)
        {
            ObjectResult result = null;

            try
            {
                string? publicId = null;
                int attemptsMade = 0;

                do
                {
                    List<string> possiblePublicIds = PublicIdGeneratorService.GenerateSecureIds(_publicIdConfig.NumberOfIdsToGenerate,
                                                                                                _publicIdConfig.Length,
                                                                                                _publicIdConfig.Characters);

                    List<string>? availablePublicIds = _transactionService.GetAvailablePublicIds(possiblePublicIds);

                    if (availablePublicIds != null && availablePublicIds.Count > 0)
                    {
                        publicId = availablePublicIds[0];
                    }

                    attemptsMade++;
                } while (publicId == null && attemptsMade < _publicIdConfig.MaxAttempts);

                if (publicId == null)
                {
                    throw new Exception("Failed to generate a unique public ID after maximum attempts.");
                }

                string userId = _webAuthService.GetCurrentUserId();
                int txnId = _transactionService.Reverse(id, userId, publicId);

                if (txnId == 0)
                {
                    ErrorResponse response = new ErrorResponse("Transaction reversal failed.");
                    result = BadRequest400(response);
                }
                else
                {
                    ItemResponse<string> response = new ItemResponse<string> { Item = publicId };
                    result = Ok200(response);
                }
            }
            catch (MySqlException dbEx)
            {
                ErrorResponse error;

                if (Enum.IsDefined(typeof(TransactionManagementErrorCode), dbEx.Number))
                {
                    error = new ErrorResponse((TransactionManagementErrorCode)dbEx.Number);
                }
                else
                {
                    error = new ErrorResponse();
                    Logger.LogErrorWithDb(dbEx, _errorLoggingService, HttpContext);
                }
                result = StatusCode(500, error);
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpGet("paginated")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemResponse<Paged<Transaction>>> GetPaginated(
            string hotelId,
            [FromQuery] int pageIndex,
            [FromQuery] int pageSize,
            [FromQuery] string? sortColumn,
            [FromQuery] string? sortDirection,
            [FromQuery] DateOnly? startDate,
            [FromQuery] DateOnly? endDate,
            [FromQuery] string? txnId,
            [FromQuery] string? parentId,
            [FromQuery] string? entityId,
            [FromQuery] int? categoryId,
            [FromQuery] int? statusId,
            [FromQuery] string? referenceNumber,
            [FromQuery] string? description,
            [FromQuery] bool? hasDocumentUrl,
            [FromQuery] int? paymentMethodId,
            [FromQuery] int? subcategoryId,
            [FromQuery] int? financePartnerId)
        {
            ObjectResult result = null;

            try
            {
                if (!string.IsNullOrEmpty(sortColumn) && !_transactionService.IsValidSortColumn(sortColumn))
                {
                    return BadRequest(new ErrorResponse($"Invalid sort column: {sortColumn}"));
                }

                if (!string.IsNullOrEmpty(sortDirection) && !_transactionService.IsValidSortDirection(sortDirection))
                {
                    return BadRequest(new ErrorResponse($"Invalid sort direction: {sortDirection}"));
                }

                Paged<Transaction>? transactions = _transactionService.GetPaginated(
                    hotelId,
                    pageIndex,
                    pageSize,
                    sortColumn,
                    sortDirection,
                    startDate,
                    endDate,
                    txnId,
                    parentId,
                    entityId,
                    categoryId,
                    statusId,
                    referenceNumber,
                    description,
                    hasDocumentUrl,
                    paymentMethodId,
                    subcategoryId,
                    financePartnerId);

                if (transactions == null)
                {
                    ErrorResponse response = new ErrorResponse("No transactions found for the specified criteria.");
                    result = NotFound404(response);
                }
                else
                {
                    ItemResponse<Paged<Transaction>> response = new ItemResponse<Paged<Transaction>> { Item = transactions };
                    result = Ok200(response);
                }
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpGet("pagination")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemResponse<Paged<Transaction>>> GetPaginated(
            string hotelId,
            [FromQuery] int pageIndex,
            [FromQuery] int pageSize,
            [FromQuery] string? sortColumn,
            [FromQuery] string? sortDirection)
        {
            ObjectResult result = null;

            try
            {
                if (!string.IsNullOrEmpty(sortColumn) && !_transactionService.IsValidSortColumn(sortColumn))
                {
                    return BadRequest(new ErrorResponse($"Invalid sort column: {sortColumn}"));
                }

                if (!string.IsNullOrEmpty(sortDirection) && !_transactionService.IsValidSortDirection(sortDirection))
                {
                    return BadRequest(new ErrorResponse($"Invalid sort direction: {sortDirection}"));
                }

                DateOnly starDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));
                DateOnly endDate = DateOnly.FromDateTime(DateTime.UtcNow);

                Paged<Transaction>? transactions = _transactionService.GetPaginated(
                    hotelId,
                    pageIndex,
                    pageSize,
                    sortColumn,
                    sortDirection,
                    starDate,
                    endDate,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null);

                if (transactions == null)
                {
                    ErrorResponse response = new ErrorResponse("No transactions found for the specified criteria.");
                    result = NotFound404(response);
                }
                else
                {
                    ItemResponse<Paged<Transaction>> response = new ItemResponse<Paged<Transaction>> { Item = transactions };
                    result = Ok200(response);
                }
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpGet("{id}/document-url")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Read)]
        public async Task<ActionResult<ItemResponse<string>>> GetSupportDocumentUrl(string id)
        {
            ObjectResult result = null;

            try
            {
                string? fileKey = _transactionService.GetSupportDocumentUrl(id);

                if (string.IsNullOrEmpty(fileKey))
                {
                    ErrorResponse response = new ErrorResponse("No document URL found for the specified transaction.");
                    result = NotFound404(response);
                }
                else
                {
                    string cacheKey = $"presigned-url-{AWSS3BucketEnum.TransactionsFiles}-{fileKey}";
                    string? url = null;
                    CacheEntry<string>? cachedEntry;
                    if (!_cache.TryGetValue(cacheKey, out cachedEntry) || cachedEntry?.ExpirationTime < DateTime.UtcNow.AddSeconds(300))
                    {
                        Logger.LogInformation("Cache miss for {CacheKey}. Generating new pre-signed URL.", cacheKey);
                        url = await _fileService.GetPresignedUrl(fileKey, AWSS3BucketEnum.TransactionsFiles);
                        var cacheOptions = new MemoryCacheEntryOptions
                        {
                            AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(3600),
                            SlidingExpiration = TimeSpan.FromSeconds(1800)
                        };
                        var expiresAt = DateTime.UtcNow.AddSeconds(3600);
                        var cacheEntry = new CacheEntry<string>(url, expiresAt);
                        _cache.Set(cacheKey, cacheEntry, cacheOptions);
                    }
                    else
                    {
                        Logger.LogInformation("Cache hit for {CacheKey}.", cacheKey);
                        url = cachedEntry.Item;
                    }

                    ItemResponse<string> response = new ItemResponse<string> { Item = url };
                    result = Ok200(response);
                }
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpGet("{id}/versions")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Read)]
        public ActionResult<ItemsResponse<TransactionVersion>> GetVersionsByTransactionId(string id)
        {
            ObjectResult result = null;
            try
            {
                List<TransactionVersion>? versions = _transactionService.GetVersionsByTransactionId(id);
                if (versions == null)
                {
                    ErrorResponse response = new ErrorResponse("No versions found for the specified transaction.");
                    result = NotFound404(response);
                }
                else
                {
                    ItemsResponse<TransactionVersion> response = new ItemsResponse<TransactionVersion> { Items = versions };
                    result = Ok200(response);
                }
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }
            return result;
        }


        [HttpGet("{id}/versions/{versionId:int}/document-url")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Read)]
        public async Task<ActionResult<ItemResponse<string>>> GetVersionSupportDocumentUrl(string id, int versionId)
        {
            ObjectResult result = null;
            try
            {
                string? fileKey = _transactionService.GetVersionSupportDocumentUrl(id, versionId);
                if (string.IsNullOrEmpty(fileKey))
                {
                    ErrorResponse response = new ErrorResponse("No document URL found for the specified transaction version.");
                    result = NotFound404(response);
                }
                else
                {
                    string cacheKey = $"presigned-url-{AWSS3BucketEnum.TransactionsFiles}-{fileKey}";
                    string? url = null;
                    CacheEntry<string>? cachedEntry;
                    if (!_cache.TryGetValue(cacheKey, out cachedEntry) || cachedEntry?.ExpirationTime < DateTime.UtcNow.AddSeconds(300))
                    {
                        Logger.LogInformation("Cache miss for {CacheKey}. Generating new pre-signed URL.", cacheKey);
                        url = await _fileService.GetPresignedUrl(fileKey, AWSS3BucketEnum.TransactionsFiles);
                        var cacheOptions = new MemoryCacheEntryOptions
                        {
                            AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(3600),
                            SlidingExpiration = TimeSpan.FromSeconds(1800)
                        };
                        var expiresAt = DateTime.UtcNow.AddSeconds(3600);
                        var cacheEntry = new CacheEntry<string>(url, expiresAt);
                        _cache.Set(cacheKey, cacheEntry, cacheOptions);
                    }
                    else
                    {
                        Logger.LogInformation("Cache hit for {CacheKey}.", cacheKey);
                        url = cachedEntry.Item;
                    }
                    ItemResponse<string> response = new ItemResponse<string> { Item = url };
                    result = Ok200(response);
                }
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }
            return result;
        }
    }
}
