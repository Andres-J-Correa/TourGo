using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Finances;
using TourGo.Services;
using TourGo.Services.Interfaces;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Responses;

namespace TourGo.Web.Api.Controllers.Finances
{
    [Route("api/transactions")]
    [ApiController]
    public class TransactionsController : BaseApiController
    {
        private readonly ITransactionService _transactionService;
        private readonly IWebAuthenticationService<int> _webAuthService;

        public TransactionsController(ILogger<TransactionsController> logger, ITransactionService transactionService, IWebAuthenticationService<int> webAuthenticationService) : base(logger)
        {
            _transactionService = transactionService;
            _webAuthService = webAuthenticationService;
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
    }
}
