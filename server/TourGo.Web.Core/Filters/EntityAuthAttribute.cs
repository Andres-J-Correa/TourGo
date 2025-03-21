using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Net;
using TourGo.Models.Enums;
using TourGo.Models.Interfaces;
using TourGo.Services;
using TourGo.Services.Interfaces.Security;

namespace TourGo.Web.Core.Filters
{
    public class EntityAuthAttribute : TypeFilterAttribute
    {
        public EntityAuthAttribute(EntityTypeEnum entityTypeId, EntityActionTypeEnum action, bool isBulk = false)
            : base(typeof(EntityAuthFilterImplementation))
        {
            Arguments = new object[] { entityTypeId, action, isBulk };
        }

        private class EntityAuthFilterImplementation : IAsyncActionFilter
        {
            private readonly IIdentityProvider<int> _identityProvider;
            private readonly ISecureEntities<int, int> _entityAuthService;
            private readonly EntityTypeEnum _entityTypeId;
            private readonly EntityActionTypeEnum _action;
            private readonly bool _isBulk;

            public EntityAuthFilterImplementation(
                IIdentityProvider<int> identityProvider,
                ISecureEntities<int, int> entityAuthService,
                EntityTypeEnum entityTypeId,
                EntityActionTypeEnum action,
                bool isBulk)
            {
                _identityProvider = identityProvider;
                _entityAuthService = entityAuthService;
                _entityTypeId = entityTypeId;
                _action = action;
                _isBulk = isBulk;
            }

            public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
            {
                if (context?.ActionArguments?.Count > 0 && !ValidateArguments(context.ActionArguments))
                {
                    HandleUnauthorizedRequest(context);
                    return;
                }

                await next();
            }

            private int GetEntityId(IDictionary<string, object> actionArguments)
            {
                const string idField = "id"; // Default field name
                int id = 0;

                if (actionArguments.TryGetValue("model", out var model) && model is IModelIdentifier requestModel)
                {
                    return requestModel.Id;
                }

                if (actionArguments.TryGetValue(idField, out var idValue))
                {
                    switch (idValue)
                    {
                        case int intId:
                            return intId;
                        case string strId when int.TryParse(strId, out int parsedId):
                            return parsedId;
                    }
                }

                return id;
            }

            private bool ValidateArguments(IDictionary<string, object> actionArguments)
            {
                int id = GetEntityId(actionArguments);

                if (id == 0) return false;

                int userId = _identityProvider.GetCurrentUserId();

                return _entityAuthService.IsAuthorized(userId, id, _action, _entityTypeId, _isBulk);
            }

            private void HandleUnauthorizedRequest(ActionExecutingContext context)
            {
                var unauthorizedResponse = new ObjectResult(new { Message = "Unauthorized Access" })
                {
                    StatusCode = (int)HttpStatusCode.Forbidden
                };
                context.Result = unauthorizedResponse;
            }
        }
    }
}
