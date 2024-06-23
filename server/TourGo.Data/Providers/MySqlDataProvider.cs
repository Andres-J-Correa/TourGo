using System.Data;
using MySql.Data.MySqlClient;
using TourGo.Data.Providers;

namespace TourGo.Data
{
    public sealed class MySqlDataProvider : IMySqlDataProvider
    {
        private readonly string connectionString;

        public MySqlDataProvider(string connectionString)
        {
            this.connectionString = connectionString;
        }

        public void ExecuteCmd(
        string storedProc,
            Action<MySqlParameterCollection> inputParamMapper,
            Action<IDataReader, short> map,
            Action<MySqlParameterCollection> returnParameters = null,
            Action<MySqlCommand> cmdModifier = null
        )
        {
            if (map == null)
                throw new NullReferenceException("ObjectMapper is required.");

            MySqlDataReader reader = null;
            MySqlCommand cmd = null;
            MySqlConnection conn = null;
            short result = 0;
            try
            {
                using (conn = GetConnection())
                {
                    if (conn != null)
                    {
                        if (conn.State != ConnectionState.Open)
                            conn.Open();

                        cmd = GetCommand(conn, storedProc, inputParamMapper);
                        if (cmd != null)
                        {
                            if (cmdModifier != null)
                                cmdModifier(cmd);

                            reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

                            while (true)
                            {
                                while (reader.Read())
                                {
                                    if (map != null)
                                        map(reader, result);
                                }

                                result += 1;

                                if (reader.IsClosed || !reader.NextResult())
                                    break;

                                if (result > 10)
                                {
                                    throw new Exception("Too many result sets returned");
                                }
                            }

                            reader.Close();

                            if (returnParameters != null)
                                returnParameters(cmd.Parameters);

                            if (conn.State != ConnectionState.Closed)
                                conn.Close();
                        }
                    }
                }
            }
            finally
            {
                if (reader != null && !reader.IsClosed)
                    reader.Close();

                if (conn != null && conn.State != ConnectionState.Closed)
                    conn.Close();
            }
        }

        public int ExecuteNonQuery(
        string storedProc,
            Action<MySqlParameterCollection> paramMapper,
            Action<MySqlParameterCollection> returnParameters = null
        )
        {
            MySqlCommand cmd = null;
            MySqlConnection conn = null;

            try
            {
                using (conn = GetConnection())
                {
                    if (conn != null)
                    {
                        if (conn.State != ConnectionState.Open)
                            conn.Open();

                        cmd = GetCommand(conn, storedProc, paramMapper);

                        if (cmd != null)
                        {
                            int returnValue = cmd.ExecuteNonQuery();

                            if (conn.State != ConnectionState.Closed)
                                conn.Close();

                            if (returnParameters != null)
                                returnParameters(cmd.Parameters);

                            return returnValue;
                        }
                    }
                }
            }
            finally
            {
                if (conn != null && conn.State != ConnectionState.Closed)
                    conn.Close();
            }

            return -1;
        }

        #region - Private Methods (Execute, GetCommand) -

        private MySqlConnection GetConnection()
        {
            return new MySqlConnection(connectionString);
        }
        private MySqlCommand GetCommand(MySqlConnection conn, string cmdText = null, Action<MySqlParameterCollection> paramMapper = null)
        {
            MySqlCommand cmd = null;
            if (conn != null)
                cmd = conn.CreateCommand();

            if (cmd != null)
            {
                if (!String.IsNullOrEmpty(cmdText))
                {
                    cmd.CommandText = cmdText;
                    cmd.CommandType = CommandType.StoredProcedure;
                }

                if (paramMapper != null)
                    paramMapper(cmd.Parameters);
            }

            return cmd;
        }

        private IDbCommand GetCommand(IDbConnection conn, string cmdText = null, Action<IDataParameterCollection> paramMapper = null)
        {
            IDbCommand cmd = null;

            if (conn != null)
                cmd = conn.CreateCommand();

            if (cmd != null)
            {
                if (!String.IsNullOrEmpty(cmdText))
                {
                    cmd.CommandText = cmdText;
                    cmd.CommandType = CommandType.StoredProcedure;
                }

                if (paramMapper != null)
                    paramMapper(cmd.Parameters);
            }

            return cmd;
        }

        #endregion - Private Methods (Execute, GetCommand) -
    }
}
