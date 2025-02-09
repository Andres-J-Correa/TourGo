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

        public bool IsAuthorized(int userId, int entityId, EntityActionType actionType, EntityType entityType)
        {
            bool isAuthorized = false;

            string proc = $"authorization_{entityType.ToString("G")}_{actionType.ToString("G")}";

            _dataProvider.ExecuteNonQuery(proc, (coll) =>
            {
                coll.AddWithValue("p_userId", userId);
                coll.AddWithValue("p_entityId", entityId);

                MySqlParameter resultOut = new MySqlParameter("@p_isAuthorized", MySqlDbType.Bit);
                resultOut.Direction = ParameterDirection.Output;
                coll.Add(resultOut);

            }, (returnColl) =>
            {
                isAuthorized = (bool)returnColl["p_isAuthorized"].Value;
            });

            return isAuthorized;
        }
    }
}
