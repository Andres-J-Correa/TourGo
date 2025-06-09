using System.Data.SqlClient;
using System.Data;
using TourGo.Data.Providers;
using TourGo.Models.Enums;
using TourGo.Services.Interfaces.Security;
using MySql.Data.MySqlClient;
using Microsoft.Extensions.Logging;

namespace TourGo.Services.Security
{
    public class EntityAuthService : ISecureEntities<string, object>
    {
        private readonly IMySqlDataProvider _dataProvider;
        private readonly ILogger<EntityAuthService> _logger;

        public EntityAuthService(IMySqlDataProvider provider, ILogger<EntityAuthService> logger)
        {
            _dataProvider = provider;
            _logger = logger;
        }

        public bool IsAuthorized(string userId, object entityId, EntityActionTypeEnum actionType, EntityTypeEnum entityType, bool isBulk)
        {
            bool isAuthorized = false;

            string proc = $"entity_auth_{entityType.ToString().ToLower()}_v2";

            try
            {
                _dataProvider.ExecuteNonQuery(proc, (col) =>
                {
                    col.AddWithValue("p_userId", userId);
                    col.AddWithValue("p_entityId", entityId);
                    col.AddWithValue("p_actionType", actionType.ToString().ToLower());
                    col.AddWithValue("p_isBulk", isBulk ? 1 : 0);

                    MySqlParameter resultOut = new MySqlParameter("p_isAuthorized", MySqlDbType.Bit);
                    resultOut.Direction = ParameterDirection.Output;
                    col.Add(resultOut);

                }, (returnColl) =>
                {
                    object resultObj = returnColl["p_isAuthorized"].Value;
                    isAuthorized = Convert.ToInt32(resultObj) == 1;
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }

            return isAuthorized;
        }
    }
}
