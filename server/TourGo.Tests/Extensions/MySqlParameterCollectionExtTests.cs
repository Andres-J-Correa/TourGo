using System;
using MySql.Data.MySqlClient;
using TourGo.Data.Extensions;
using Xunit;

namespace TourGo.Tests.Extensions
{
    public class MySqlParameterCollectionExtTests
    {
        public MySqlParameterCollectionExtTests() { }

        [Fact]
        public void AddWithNullableValue_WhenValueIsNull_ShouldAddDBNullValue()
        {
            var coll = new MySqlCommand().Parameters;
            coll.AddWithNullableValue("p_null", null);

            Assert.True(coll.Contains("p_null"));
            Assert.Equal(DBNull.Value, coll["p_null"].Value);
        }

        [Fact]
        public void AddWithNullableValue_StringWhitespace_ShouldAddDBNull()
        {
            var coll = new MySqlCommand().Parameters;
            coll.AddWithNullableValue("p_ws", "   ");

            Assert.Equal(DBNull.Value, coll["p_ws"].Value);
        }

        [Fact]
        public void AddWithNullableValue_StringNonEmpty_ShouldAddString()
        {
            var coll = new MySqlCommand().Parameters;
            coll.AddWithNullableValue("p_str", "hello");

            Assert.Equal("hello", coll["p_str"].Value);
        }

        [Fact]
        public void AddWithNullableValue_DateOnly_ShouldFormatDefault()
        {
            var coll = new MySqlCommand().Parameters;
            var d = new DateOnly(2020, 1, 2);
            coll.AddWithNullableValue("p_date", d);

            Assert.Equal("2020-01-02", coll["p_date"].Value);
        }

        [Fact]
        public void AddWithNullableValue_DateTime_ShouldFormatDefault()
        {
            var coll = new MySqlCommand().Parameters;
            var dt = new DateTime(2020, 1, 2, 3, 4, 5);
            coll.AddWithNullableValue("p_dt", dt);

            Assert.Equal("2020-01-02T03:04:05", coll["p_dt"].Value);
        }

        [Fact]
        public void AddWithNullableValue_DateTime_WithCustomFormat_ShouldUseFormat()
        {
            var coll = new MySqlCommand().Parameters;
            var dt = new DateTime(2020, 12, 31, 23, 59, 59);
            coll.AddWithNullableValue("p_dt_fmt", dt, "yyyy/MM/dd");

            Assert.Equal("2020/12/31", coll["p_dt_fmt"].Value);
        }

        [Fact]
        public void AddWithNullableValue_NumericAndBool_ShouldPreserveValue()
        {
            var coll = new MySqlCommand().Parameters;
            coll.AddWithNullableValue("p_int", 123);
            coll.AddWithNullableValue("p_dec", 1.23m);
            coll.AddWithNullableValue("p_bool", true);

            Assert.Equal(123, coll["p_int"].Value);
            Assert.Equal(1.23m, coll["p_dec"].Value);
            Assert.Equal(true, coll["p_bool"].Value);
        }

        private enum SampleEnum : short { A = 1, B = 2 }

        [Fact]
        public void AddWithNullableValue_Enum_ShouldAddUnderlyingValue()
        {
            var coll = new MySqlCommand().Parameters;
            coll.AddWithNullableValue("p_enum", SampleEnum.B);

            // underlying type is short
            Assert.Equal((short)2, coll["p_enum"].Value);
        }
    }
}
