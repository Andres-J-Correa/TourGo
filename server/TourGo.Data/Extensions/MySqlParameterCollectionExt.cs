using Microsoft.SqlServer.Server;
using MySql.Data.MySqlClient;
using System.Data;

namespace TourGo.Data.Extensions
{
    public static class MySqlParameterCollectionExt
    {
        public static void AddOutputParameter(this MySqlParameterCollection coll, string parameterName, MySqlDbType sqlDbType)
        {
            MySqlParameter p = new MySqlParameter(parameterName, sqlDbType);
            p.Direction = ParameterDirection.Output;
            coll.Add(p);
        }
    }
}