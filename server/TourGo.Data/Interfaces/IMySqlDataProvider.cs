using System.Data;
using MySql.Data.MySqlClient;

namespace TourGo.Data.Providers
{
    public interface IMySqlDataProvider
    {
        /// <summary>
        /// This is used when we want to execute a SQL SELECT Statement. This is intended to bring
        /// back a dataset/grid/table, even though it may be a 1 row result.
        /// </summary>

        /// <param name="storedProc">The name of the stored procedure we want to execute</param>
        /// <param name="inputParamMapper">
        /// A method that accepts MySqlParameterCollection as the first parameter. This
        /// MySqlParameterCollection is the collection of parameters sent to the database specified by
        /// the connectionSource parameter. You should use it to "map" values you have in .Net to the
        /// named SQL Parameters you have in your stored procedure.
        /// </param>
        /// <param name="singleRecordMapper">
        /// The method will be called 1 time for every record returned from your query regardless of
        /// how many "tables" your query returns. If your query returns multiple "Tables" you should
        /// use the second parameter to determine which table you are currently reading. This second
        /// value is a ZERO based index.
        /// </param>
        /// <param name="returnParameters">
        /// The method will be called after your proc is executed. It is your opportunity to take a
        /// look at the parameters and inspect for any Output params from your SQL Procedure.
        /// </param>
        /// <param name="cmdModifier">
        /// Supply this method if you want to modify the underlying MySqlCommand object such as
        /// extending the timeout property.
        /// </param>
        void ExecuteCmd(
        string storedProc,
            Action<MySqlParameterCollection> inputParamMapper,
            Action<IDataReader, short> singleRecordMapper,
            Action<MySqlParameterCollection> returnParameters = null,
            Action<MySqlCommand> cmdModifier = null);

        /// <summary>
        /// This is used to execute SQL Statements like UPDATE, DELETE, INSERT.
        /// </summary>

        /// <param name="storedProc">The name of the stored procedure we want to execute</param>
        /// <param name="inputParamMapper">
        /// A method that accepts MySqlParameterCollection as the first parameter. This
        /// MySqlParameterCollection is the collection of parameters sent to the database specified by
        /// the connectionSource parameter. You should use it to "map" values you have in .Net to the
        /// named SQL Parameters you have in your stored procedure.
        /// </param>
        /// <param name="returnParameters">
        /// The method will be called after your proc is executed. It is your opportunity to take a
        /// look at the parameters and inspect for any Output params from your SQL Procedure.
        /// </param>
        /// <param name="cmdModifier">
        /// Supply this method if you want to modify the underlying MySqlCommand object such as
        /// extending the timeout property.
        /// </param>
        /// <returns>The number of Rows Affected</returns>
        int ExecuteNonQuery(string storedProc,
            Action<MySqlParameterCollection> inputParamMapper,
            Action<MySqlParameterCollection> returnParameters = null);
    }
}
