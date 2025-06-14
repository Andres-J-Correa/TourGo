using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Finances;
using TourGo.Services;
using TourGo.Services.Interfaces;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Responses;
using TourGo.Web.Api.Extensions;
using TourGo.Models.Requests;
using TourGo.Models.Enums.Transactions;
using Microsoft.Extensions.Caching.Memory;
using TourGo.Models.Domain;
using TourGo.Models;
using TourGo.Services.Hotels;
using MySql.Data.MySqlClient;
using TourGo.Web.Models.Enums;
using TourGo.Services.Interfaces.Hotels;

namespace TourGo.Web.Api.Controllers.Finances
{
    [Route("api/transactions")]
    [ApiController]
    public class TransactionsController : BaseApiController
    {
        private readonly ITransactionService _transactionService;
        private readonly IWebAuthenticationService<string> _webAuthService;
        private readonly IErrorLoggingService _errorLoggingService;
        private readonly IFileService _fileService;
        private readonly IMemoryCache _cache;
        private readonly IHotelService _hotelService;

        public TransactionsController(ILogger<TransactionsController> logger, 
            ITransactionService transactionService, 
            IWebAuthenticationService<string> webAuthenticationService,
            IErrorLoggingService errorLoggingService,
            IFileService fileService,
            IMemoryCache memoryCache,
            IHotelService hotelService) : base(logger)
        {
            _transactionService = transactionService;
            _webAuthService = webAuthenticationService;
            _errorLoggingService = errorLoggingService;
            _fileService = fileService;
            _cache = memoryCache;
            _hotelService = hotelService;
        }

        [HttpPost("hotel/{hotelId}")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> Add(TransactionAddRequest model, string hotelId)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                int id = _transactionService.Add(model, userId, hotelId);

                if(id == 0)
                {
                    throw new Exception("Transaction not created");
                }

                ItemResponse<int> response = new ItemResponse<int> { Item = id };
                result = Created201(response);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }

            return result ;
        }

        [HttpGet("hotel/{hotelId}/entity/{entityId:int}")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Read, isBulk:true)]
        public ActionResult<ItemsResponse<Transaction>> GetByEntityId(int entityId, string hotelId)
        {
            ObjectResult result = null;

            try
            {
                List<Transaction>? transactions = _transactionService.GetByEntityId(entityId);

                if (transactions == null)
                {
                    ErrorResponse response = new ErrorResponse("No transactions found for the specified entity.");
                    result = NotFound404(response);
                } else
                {
                    ItemsResponse<Transaction> response = new ItemsResponse<Transaction> { Items = transactions };
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

        [HttpPatch("{id:int}/description")]
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

        [HttpGet("{id:int}/document-url")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Read)]
        public async Task<ActionResult<ItemResponse<string>>> GetSupportDocumentUrl(int id)
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

        [HttpPost("hotel/{hotelId}/transaction/{id:int}/document-url")]
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

        [HttpPut("{id:int}/reverse")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Update)]
        public ActionResult<ItemResponse<int>> Reverse(int id)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                int txnId = _transactionService.Reverse(id, userId);

                if (txnId == 0)
                {
                    ErrorResponse response = new ErrorResponse("Transaction reversal failed.");
                    result = BadRequest400(response);
                }
                else
                {
                    ItemResponse<int> response = new ItemResponse<int> { Item = txnId };
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

        [HttpGet("hotel/{hotelId}/paginated")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemResponse<Paged<Transaction>>> GetPaginated(
            string hotelId,
            [FromQuery] int pageIndex, 
            [FromQuery] int pageSize,
            [FromQuery] string? sortColumn, 
            [FromQuery] string? sortDirection,
            [FromQuery] DateOnly? startDate,
            [FromQuery] DateOnly? endDate,
            [FromQuery] int? txnId,
            [FromQuery] int? parentId,
            [FromQuery] int? entityId,
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

        [HttpGet("hotel/{hotelId}/pagination")]
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

        [HttpGet("{id:int}/versions")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Read)]
        public ActionResult<ItemsResponse<Transaction>> GetVersionsByTransactionId(int id)
        {
            ObjectResult result = null;
            try
            {
                List<Transaction>? versions = _transactionService.GetVersionsByTransactionId(id);
                if (versions == null)
                {
                    ErrorResponse response = new ErrorResponse("No versions found for the specified transaction.");
                    result = NotFound404(response);
                }
                else
                {
                    ItemsResponse<Transaction> response = new ItemsResponse<Transaction> { Items = versions };
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

        [HttpGet("{id:int}/versions/{versionId:int}/document-url")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Read)]
        public async Task<ActionResult<ItemResponse<string>>> GetVersionSupportDocumentUrl(int id, int versionId)
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
