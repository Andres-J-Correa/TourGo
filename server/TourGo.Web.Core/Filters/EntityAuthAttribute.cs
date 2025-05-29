using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Net;
using TourGo.Models.Enums;
using TourGo.Models.Interfaces;
using TourGo.Services;
using TourGo.Services.Interfaces.Security;
using TourGo.Web.Models.Enums;
using TourGo.Web.Models.Responses;

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
            private readonly ISecureEntities<int, object> _entityAuthService;
            private readonly EntityTypeEnum _entityTypeId;
            private readonly EntityActionTypeEnum _action;
            private readonly bool _isBulk;

            public EntityAuthFilterImplementation(
                IIdentityProvider<int> identityProvider,
                ISecureEntities<int, object> entityAuthService,
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

            private T GetEntityId<T>(IDictionary<string, object> actionArguments, string idField = "id")
            {
                // Check for a model implementing IModelIdentifier
                if (typeof(T) == typeof(int) &&
                    actionArguments.TryGetValue("model", out var model) &&
                    model is IModelIdentifier requestModel)
                {
                    return (T)(object)requestModel.Id;
                }

                // Try to extract the ID value directly
                if (actionArguments.TryGetValue(idField, out var idValue))
                {
                    try
                    {
                        if (idValue is T tValue)
                            return tValue;

                        // Special handling: try parsing string to int
                        if (typeof(T) == typeof(int) && idValue is string strId && int.TryParse(strId, out int parsedId))
                        {
                            return (T)(object)parsedId;
                        }

                        // Try converting using Convert.ChangeType
                        return (T)Convert.ChangeType(idValue, typeof(T));
                    }
                    catch
                    {
                        // Ignore and fall through to default
                    }
                }

                return default;
            }


            private bool ValidateArguments(IDictionary<string, object> actionArguments)
            {
                int userId = _identityProvider.GetCurrentUserId();

                int id = GetEntityId<int>(actionArguments);

                if (id > 0)
                {
                    return _entityAuthService.IsAuthorized(userId, id, _action, _entityTypeId, _isBulk);
                }
                else
                {
                    string idString = GetEntityId<string>(actionArguments);

                    if (!string.IsNullOrEmpty(idString))
                    {
                        return _entityAuthService.IsAuthorized(userId, idString, _action, _entityTypeId, _isBulk);
                    }

                }
                return false;
            }

            private void HandleUnauthorizedRequest(ActionExecutingContext context)
            {
                ErrorResponse response = new ErrorResponse(AuthenticationErrorCode.Forbidden);
                var unauthorizedResponse = new ObjectResult(response)
                {
                    StatusCode = (int)HttpStatusCode.Forbidden
                };

                context.Result = unauthorizedResponse;
            }
        }
    }
}
