using Microsoft.SqlServer.Server;
using MySql.Data.MySqlClient;
using System.Data;

namespace TourGo.Data.Extensions
{
    public static class MySqlParameterCollectionExt
    {
        public static void AddOutputParameter(this MySqlParameterCollection coll, string parameterName, SqlDbType sqlDbType)
        {
            MySqlParameter p = new MySqlParameter(parameterName, sqlDbType);
            p.Direction = ParameterDirection.Output;
            coll.Add(p);
        }

        public static void AddStructuredParameter(this MySqlParameterCollection coll, string parameterName, IEnumerable<SqlDataRecord> items)
        {
            MySqlParameter p = new MySqlParameter(parameterName, SqlDbType.Structured);

            if (items != null && items.Any())
            {
                p.Value = items;
            }

            coll.Add(p);
        }
    }
}