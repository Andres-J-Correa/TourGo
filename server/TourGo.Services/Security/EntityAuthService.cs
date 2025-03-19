using System.Data.SqlClient;
using System.Data;
using TourGo.Data.Providers;
using TourGo.Models.Enums;
using TourGo.Services.Interfaces.Security;
using MySql.Data.MySqlClient;

namespace TourGo.Services.Security
{
    public class EntityAuthService : ISecureEntities<int, int>
    {
        private readonly IMySqlDataProvider _dataProvider;

        public EntityAuthService(IMySqlDataProvider provider)
        {
            _dataProvider = provider;
        }

        public bool IsAuthorized(int userId, int entityId, EntityActionTypeEnum actionType, EntityTypeEnum entityType)
        {
            bool isAuthorized = false;

            string proc = $"entity_auth";

            _dataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithValue("p_userId", userId);
                col.AddWithValue("p_entityId", entityId);
                col.AddWithValue("p_actionType", actionType.ToString().ToLower());
                col.AddWithValue("p_resourceTypeId", (int)entityType);

                MySqlParameter resultOut = new MySqlParameter("p_isAuthorized", MySqlDbType.Bit);
                resultOut.Direction = ParameterDirection.Output;
                col.Add(resultOut);

            }, (returnColl) =>
            {
                object resultObj = returnColl["p_isAuthorized"].Value;
                isAuthorized = Convert.ToInt32(resultObj) == 1;
            });

            return isAuthorized;
        }
    }
}
