using MySql.Data.MySqlClient;
using Scriban;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Data;
using TourGo.Data.Providers;
using TourGo.Models.Domain.Bookings;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Domain.Invoices;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Invoices;
using TourGo.Services.Customers;
using TourGo.Services.Interfaces.Hotels;

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

        public InvoicePdfModel? GetInvoicePdfModel(string invoiceId, string hotelId)
        {
            string proc = "invoices_select_for_pdf";
            InvoicePdfModel? pdfModel = null;
            _mySqlDataProvider.ExecuteCmd(proc, (param) =>
            {
                param.AddWithValue("p_invoiceId", invoiceId);
                param.AddWithValue("p_hotelId", hotelId);
            }, (IDataReader reader, short set) =>
            {
                int index = 0;
                if (set == 0)
                {
                    pdfModel = new InvoicePdfModel();
                    pdfModel.InvoiceNumber = reader.GetSafeString(index++);
                    pdfModel.Subtotal = reader.GetSafeDecimal(index++);
                    pdfModel.Paid = reader.GetSafeDecimal(index++);
                    pdfModel.Charges = reader.GetSafeDecimal(index++);
                    pdfModel.Total = reader.GetSafeDecimal(index++);
                    pdfModel.Balance = reader.GetSafeDecimal(index++);
                    pdfModel.HotelName = reader.GetSafeString(index++);
                    pdfModel.HotelPhone = reader.GetSafeString(index++);
                    pdfModel.HotelEmail = reader.GetSafeString(index++);
                    pdfModel.HotelAddress = reader.GetSafeString(index++);
                    pdfModel.HotelTaxId = reader.GetSafeString(index++);
                    pdfModel.CustomerFirstName = reader.GetSafeString(index++);
                    pdfModel.CustomerLastName = reader.GetSafeString(index++);
                    pdfModel.CustomerPhone = reader.GetSafeString(index++);
                    pdfModel.CustomerEmail = reader.GetSafeString(index++);
                    pdfModel.CustomerDocumentNumber = reader.GetSafeString(index++);
                    pdfModel.InvoiceTerms = reader.GetSafeString(index++);
                }
                if (set == 1 && pdfModel != null)
                {
                    BookingPdfModel booking = new BookingPdfModel();
                    booking.Id = reader.GetSafeString(index++);
                    booking.ArrivalDate = reader.GetSafeDateTime(index++).ToString("dd/MM/yyyy");
                    booking.DepartureDate = reader.GetSafeDateTime(index++).ToString("dd/MM/yyyy");
                    booking.AdultGuests = reader.GetSafeInt32(index++);
                    booking.ChildGuests = reader.GetSafeInt32(index++);
                    booking.Total = reader.GetSafeDecimal(index++);
                    booking.Subtotal = reader.GetSafeDecimal(index++);
                    booking.Charges = reader.GetSafeDecimal(index++);
                    booking.RawRoomBookings  = reader.DeserializeObjectSafely<List<RoomBooking>>(index++, () => null) ?? [];
                    booking.ExtraCharges = reader.DeserializeObjectSafely<List<ExtraCharge>>(index++, () => null) ?? [];
                    booking.GeneralCharges = reader.DeserializeObjectSafely<List<ExtraCharge>>(index++, () => null) ?? [];

                    pdfModel.Bookings.Add(booking);
                }
            });

            if(pdfModel == null)
            {
                return null;
            }

            pdfModel.Bookings.ForEach(booking =>
            {
                List<ExtraCharge> roomBasedCharges = [];

                booking.ExtraCharges.ForEach(charge =>
                {
                    if (charge.Type.Id == (int)ExtraChargeTypeEnum.PerPerson || charge.Type.Id == (int)ExtraChargeTypeEnum.General)
                    {
                        booking.GeneralCharges.Add(charge);
                    }
                    else
                    {
                        roomBasedCharges.Add(charge);
                    }
                });

                booking.GeneralCharges = [.. booking.GeneralCharges.Select(charge =>
                                                {
                                                    decimal amount = 0;
                                                    switch ((ExtraChargeTypeEnum)charge.Type.Id)
                                                    {
                                                        case ExtraChargeTypeEnum.PerPerson:
                                                            amount = booking.AdultGuests * charge.Amount;
                                                            break;
                                                        default:
                                                            amount = charge.Amount;
                                                            break;
                                                    }
                                                    return new ExtraCharge
                                                    {
                                                        Name = charge.Name,
                                                        Amount = amount,
                                                    };
                                                })];

                booking.RoomBookings = RoomBookingGrouper.GroupRoomBookings(booking.RawRoomBookings, roomBasedCharges);
            });

            return pdfModel;
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
