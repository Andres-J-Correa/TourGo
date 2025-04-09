using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Data;
using TourGo.Data.Providers;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Customers;
using TourGo.Models.Requests.Customers;
using TourGo.Services.Interfaces.Customers;

namespace TourGo.Services.Customers
{
    public class CustomerService : ICustomerService
    {
        private readonly IMySqlDataProvider _mySqlDataProvider;

        public CustomerService(IMySqlDataProvider dataProvider)
        {
            _mySqlDataProvider = dataProvider;
        }

        public int Add(CustomerAddEditRequest model, int userId)
        {
            string proc = "customers_insert";
            int newId = 0;

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_firstName", model.FirstName);
                param.AddWithValue("p_lastName", model.LastName);
                param.AddWithValue("p_phone", model.Phone);
                param.AddWithValue("p_email", model.Email);
                param.AddWithValue("p_documentNumber", model.DocumentNumber);
                param.AddWithValue("p_hotelId", model.Id);
                param.AddWithValue("p_modifiedBy", userId);

                MySqlParameter newIdOut = new MySqlParameter("p_newId", MySqlDbType.Int32);
                newIdOut.Direction = System.Data.ParameterDirection.Output;
                param.Add(newIdOut);
            }, (returnColl) =>
            {
                object newIdObj = returnColl["p_newId"].Value;

                newId = int.TryParse(newIdObj.ToString(), out newId) ? newId : 0;
            });

            return newId;
        }

        public Customer? GetByDocumentNumber(string documentNumber)
        {
            string proc = "customers_select_by_document_number";
            Customer customer = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_documentNumber", documentNumber);
            }, (IDataReader reader, short set) =>
            {

                int index = 0;
                customer = MapCustomer(reader, ref index);
            });

            return customer;
        }

        private static Customer MapCustomer(IDataReader reader, ref int index)
        {
            return new Customer
            {
                Id = reader.GetSafeInt32(index++),
                FirstName = reader.GetSafeString(index++),
                LastName = reader.GetSafeString(index++),
                Phone = reader.GetSafeString(index++),
                Email = reader.GetSafeString(index++),
                DocumentNumber = reader.GetSafeString(index++),
                Status = new Lookup
                {
                    Id = reader.GetSafeInt32(index++)
                }
            };
        }
    }
}
