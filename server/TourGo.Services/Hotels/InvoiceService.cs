using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using TourGo.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Data.Providers;
using TourGo.Models.Domain.Invoices;
using TourGo.Models.Requests.Invoices;
using TourGo.Services.Interfaces.Hotels;
using System.Data;
using TourGo.Models.Domain.Bookings;
using TourGo.Services.Customers;
using TourGo.Models.Domain.Hotels;

namespace TourGo.Services.Hotels
{
    public class InvoiceService : IInvoiceService
    {
        readonly private IMySqlDataProvider _mySqlDataProvider;

        public InvoiceService(IMySqlDataProvider mySqlDataProvider)
        {
            _mySqlDataProvider = mySqlDataProvider;
        }

        public int Add(InvoiceAddRequest model, string userId, string hotelId)
        {
            string proc = "invoices_insert_v3";
            int newId = 0;

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_parentId", model.ParentId.HasValue ? model.ParentId : DBNull.Value);
                param.AddWithValue("p_externalId", model.ExternalId ?? (object)DBNull.Value);
                param.AddWithValue("p_customerId", model.CustomerId);
                param.AddWithValue("p_hotelId", hotelId);
                param.AddWithValue("p_typeId", model.TypeId);
                param.AddWithValue("p_statusId", model.StatusId);
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_subtotal", model.Subtotal);
                param.AddWithValue("p_paid", model.Paid);
                param.AddWithValue("p_charges", model.Charges);
                param.AddWithValue("p_total", model.Total);
                param.AddWithValue("p_balanceDue", model.BalanceDue);

                MySqlParameter newIdOut = new MySqlParameter("p_newId", MySqlDbType.Int32);
                newIdOut.Direction = ParameterDirection.Output;
                param.Add(newIdOut);
            }, (returnColl) =>
            {
                object resultObj = returnColl["p_newId"].Value;
                newId = Convert.ToInt32(resultObj);
            });

            return newId;
        }

        public void Update(InvoiceUpdateRequest model, string userId)
        {
            string proc = "invoices_update_v2";

            _mySqlDataProvider.ExecuteNonQuery(proc, (param) =>
            {
                param.AddWithValue("p_id", model.Id);
                param.AddWithValue("p_parentId", model.ParentId.HasValue ? model.ParentId : DBNull.Value);
                param.AddWithValue("p_externalId", model.ExternalId ?? (object)DBNull.Value);
                param.AddWithValue("p_customerId", model.CustomerId);
                param.AddWithValue("p_typeId", model.TypeId);
                param.AddWithValue("p_statusId", model.StatusId);
                param.AddWithValue("p_modifiedBy", userId);
                param.AddWithValue("p_subtotal", model.Subtotal);
                param.AddWithValue("p_paid", model.Paid);
                param.AddWithValue("p_charges", model.Charges);
                param.AddWithValue("p_total", model.Total);
                param.AddWithValue("p_balanceDue", model.BalanceDue);
                param.AddWithValue("p_locked", model.Locked ? 1 : 0);
            });
        }

        public InvoiceWithEntities? GetWithEntitiesById(string invoiceId, string hotelId)
        {
            string proc = "invoices_select_with_entities_by_id_v7";
            InvoiceWithEntities? invoiceWithEntities = null;

            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_invoiceId", invoiceId);
                param.AddWithValue("p_hotelId", hotelId);
            }, (IDataReader reader, short set) =>
            {
                int index = 0;

                if (set == 0)
                {
                    Invoice invoice = MapInvoice(reader, ref index);
                    invoiceWithEntities = new InvoiceWithEntities(invoice);
                    invoiceWithEntities.MapFromReader(reader, ref index);
                }

                if (set == 1 && invoiceWithEntities != null)
                {
                    index = 0;
                    invoiceWithEntities.Customer = CustomerService.MapCustomer(reader, ref index);
                }

                if (set == 2 && invoiceWithEntities != null)
                {
                    Booking booking = BookingService.MapBooking(reader, ref index);
                    booking.RoomBookings = reader.DeserializeObjectSafely<List<RoomBooking>>(index++, () => null);
                    booking.ExtraCharges = reader.DeserializeObjectSafely<List<ExtraCharge>>(index++, () => null);
                    booking.PersonalizedCharges = reader.DeserializeObjectSafely<List<ExtraCharge>>(index++, () => null);
                    invoiceWithEntities.Bookings ??= new List<Booking>();
                    invoiceWithEntities.Bookings.Add(booking);
                }

                if (set == 3 && invoiceWithEntities != null)
                {
                    invoiceWithEntities.Terms = reader.GetSafeString(0);
                }
            });

            return invoiceWithEntities;
        }

        private static Invoice MapInvoice(IDataReader reader, ref int index)
        {
            Invoice invoice = new Invoice();
            invoice.Id = reader.GetSafeString(index++);
            invoice.ParentId = reader.GetSafeString(index++);
            invoice.ExternalId = reader.GetSafeString(index++);
            invoice.TypeId = reader.GetSafeInt32(index++);
            invoice.Subtotal = reader.GetSafeDecimal(index++);
            invoice.Paid = reader.GetSafeDecimal(index++);
            invoice.Charges = reader.GetSafeDecimal(index++);
            invoice.Total = reader.GetSafeDecimal(index++);
            invoice.BalanceDue = reader.GetSafeDecimal(index++);
            invoice.Locked = reader.GetSafeBool(index++);
            invoice.StatusId = reader.GetSafeInt32(index++);
            return invoice;
        }
    }
}
