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

namespace TourGo.Web.Api.Controllers.Finances
{
    [Route("api/transactions")]
    [ApiController]
    public class TransactionsController : BaseApiController
    {
        private readonly ITransactionService _transactionService;
        private readonly IWebAuthenticationService<int> _webAuthService;
        private readonly IErrorLoggingService _errorLoggingService;
        private readonly IFileService _fileService;
        private readonly IMemoryCache _cache;

        public TransactionsController(ILogger<TransactionsController> logger, 
            ITransactionService transactionService, 
            IWebAuthenticationService<int> webAuthenticationService,
            IErrorLoggingService errorLoggingService,
            IFileService fileService,
            IMemoryCache memoryCache) : base(logger)
        {
            _transactionService = transactionService;
            _webAuthService = webAuthenticationService;
            _errorLoggingService = errorLoggingService;
            _fileService = fileService;
            _cache = memoryCache;
        }

        [HttpPost("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> Add(TransactionAddRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                int id = _transactionService.Add(model, userId);

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

        [HttpGet("hotel/{id:int}/entity/{entityId:int}")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Read, isBulk:true)]
        public ActionResult<ItemsResponse<Transaction>> GetByEntityId(int entityId, int id)
        {
            ObjectResult result = null;

            try
            {
                List<Transaction>? transactions = _transactionService.GetByEntityId(entityId);

                if (transactions == null)
                {
                    result = NotFound("No transactions found for the given entity ID.");
                } else
                {
                    ItemsResponse<Transaction> response = new ItemsResponse<Transaction> { Items = transactions };
                    result = Ok(response);
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
                    result = NotFound("File not found");
                }
                else
                {
                    string cacheKey = $"presigned-url-{AWSS3BucketEnum.TransactionsFiles}-{fileKey}";
                    string? url = null;
                    if (!_cache.TryGetValue(cacheKey, out Tuple<string, DateTime> cachedEntry) || cachedEntry.Item2 < DateTime.UtcNow.AddSeconds(300))
                    {
                        Logger.LogInformation("Cache miss for {CacheKey}. Generating new pre-signed URL.", cacheKey);
                        url = await _fileService.GetPresignedUrl(fileKey, AWSS3BucketEnum.TransactionsFiles);
                        var cacheOptions = new MemoryCacheEntryOptions
                        {
                            AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(3500),
                            SlidingExpiration = TimeSpan.FromSeconds(1800)
                        };
                        _cache.Set(cacheKey, Tuple.Create(url, DateTime.UtcNow.AddSeconds(3600)), cacheOptions);
                    }
                    else
                    {
                        Logger.LogInformation("Cache hit for {CacheKey}.", cacheKey);
                        url = cachedEntry.Item1;
                    }

                    ItemResponse<string> response = new ItemResponse<string> { Item = url };
                    result = Ok(response);
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

        [HttpPut("{id:int}/document-url")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> UpdateDocumentUrl([FromForm] TransactionFileAddRequest model)
        {
            ObjectResult result = null;

            try
            {
                if (model.File.Length == 0)
                {
                    return BadRequest("File is empty");
                }

                string fileKey = _transactionService.GetFileKey(model);

                _fileService.Upload(model.File, AWSS3BucketEnum.TransactionsFiles, fileKey);
                _transactionService.UpdateDocumentUrl(model.Id, fileKey);

                SuccessResponse response = new SuccessResponse();
                result = Ok(response);
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpGet("hotel/{id:int}/paginated")]
        [EntityAuth(EntityTypeEnum.Transactions, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemResponse<Paged<Transaction>>> GetPaginated(
            int id,
            [FromQuery] int pageIndex, 
            [FromQuery] int pageSize,
            [FromQuery] string? sortColumn, 
            [FromQuery] string? sortDirection,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
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
                    result = NotFound("No transactions found.");
                }
                else
                {
                    ItemResponse<Paged<Transaction>> response = new ItemResponse<Paged<Transaction>> { Item = transactions };
                    result = Ok(response);
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
