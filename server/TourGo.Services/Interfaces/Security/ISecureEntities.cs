using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Models.Enums;

namespace TourGo.Services.Interfaces.Security
{
    /// <summary>
    /// </summary>
    /// <typeparam name="T">Type used for UserId</typeparam>
    /// <typeparam name="K">Type used for EntityId</typeparam>
    public interface ISecureEntities<T, K>
    {
        bool IsAuthorized(T userId, K entityId, EntityActionTypeEnum actionType, EntityTypeEnum entityType, bool isBulk);
    }
}
