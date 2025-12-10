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

        public static void AddWithNullableValue(this MySqlParameterCollection parameters, string name, object? value, string? format = null)
        {
            ArgumentNullException.ThrowIfNull(parameters);
            if (value is null)
            {
                parameters.AddWithValue(name, DBNull.Value);
                return;
            }

            // Strings: treat null or whitespace as DBNull
            if (value is string s)
            {
                parameters.AddWithValue(name, string.IsNullOrWhiteSpace(s) ? DBNull.Value : s);
                return;
            }

            // DateOnly: format using provided format or default to ISO date
            if (value is DateOnly d)
            {
                var fmt = string.IsNullOrEmpty(format) ? "yyyy-MM-dd" : format;
                parameters.AddWithValue(name, d.ToString(fmt));
                return;
            }

            // DateTime: format using provided format or default to ISO datetime
            if (value is DateTime dt)
            {
                var fmt = string.IsNullOrEmpty(format) ? "yyyy-MM-ddTHH:mm:ss" : format;
                parameters.AddWithValue(name, dt.ToString(fmt));
                return;
            }

            // For common numeric and boolean types, pass the value directly (boxed value types arrive as their underlying type)
            if (value is bool || value is byte || value is sbyte || value is short || value is ushort || value is int || value is uint || value is long || value is ulong || value is float || value is double || value is decimal)
            {
                parameters.AddWithValue(name, value);
                return;
            }

            // Fallback: if it's an enum, use its underlying numeric value; otherwise pass ToString()
            var type = value.GetType();
            if (type.IsEnum)
            {
                // convert to underlying numeric value
                var underlying = Convert.ChangeType(value, Enum.GetUnderlyingType(type));
                parameters.AddWithValue(name, underlying);
                return;
            }

            // As a last resort, just add the value (Let MySql connector handle conversion) - convert empty strings to DBNull already handled
            parameters.AddWithValue(name, value);
        }

    }
}