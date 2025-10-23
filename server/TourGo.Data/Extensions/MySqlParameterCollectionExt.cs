using Microsoft.SqlServer.Server;
using MySql.Data.MySqlClient;
using System.Data;

namespace TourGo.Data.Extensions
{
    public static class MySqlParameterCollectionExt
    {
        public static void AddOutputParameter(this MySqlParameterCollection parameters, string parameterName, MySqlDbType sqlDbType)
        {
            ArgumentNullException.ThrowIfNull(parameters);
            MySqlParameter p = new MySqlParameter(parameterName, sqlDbType);
            p.Direction = ParameterDirection.Output;
            parameters.Add(p);
        }

        /// <summary>
        /// Adds a string parameter, mapping null or whitespace values to DBNull.Value.
        /// </summary>
        /// <param name="parameters">The MySqlParameterCollection to add to.</param>
        /// <param name="name">Parameter name (without '@').</param>
        /// <param name="value">String value; null or whitespace becomes DBNull.Value.</param>
        public static void AddWithNullableString(this MySqlParameterCollection parameters, string name, string? value)
        {
            ArgumentNullException.ThrowIfNull(parameters);
            parameters.AddWithValue(name, string.IsNullOrWhiteSpace(value) ? DBNull.Value : value);
        }

        public static void AddWithNullableObject(this MySqlParameterCollection parameters, string name, object? value)
        {
            ArgumentNullException.ThrowIfNull(parameters);
            parameters.AddWithValue(name, value ?? DBNull.Value);
        }

        public static void AddWithNullableInt(this MySqlParameterCollection parameters, string name, int? value)
        {
            ArgumentNullException.ThrowIfNull(parameters);
            parameters.AddWithValue(name, value.HasValue ? value.Value : DBNull.Value);
        }

        public static void AddWithNullableDateOnly(this MySqlParameterCollection parameters, string name, DateOnly? date, string? format = "yyyy-MM-dd")
        {
            ArgumentNullException.ThrowIfNull(parameters);
            parameters.AddWithValue(name, date.HasValue ? date.Value.ToString(format) : DBNull.Value);
        }

        public static void AddWithNullableDateTime(this MySqlParameterCollection parameters, string name, DateTime? dateTime, string? format = "yyyy-MM-ddTHH:mm:ss")
        {
            ArgumentNullException.ThrowIfNull(parameters);
            parameters.AddWithValue(name, dateTime.HasValue ? dateTime.Value.ToString(format) : DBNull.Value);
        }

        public static void AddWithNullableDecimal(this MySqlParameterCollection parameters, string name, decimal? value)
        {
            ArgumentNullException.ThrowIfNull(parameters);
            parameters.AddWithValue(name, value.HasValue ? value.Value : DBNull.Value);
        }

    }
}