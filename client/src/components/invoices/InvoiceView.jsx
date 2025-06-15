import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Row, Col, Card, CardBody, CardHeader, Button } from "reactstrap";
import dayjs from "dayjs";
import {
  faPhone,
  faEnvelope,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { groupRoomBookings } from "components/bookings/booking-summary/helpers";
import RoomCard from "components/bookings/booking-summary/RoomCard";
import { getDetailsById as getHotelDetailsById } from "services/hotelService";
import { getWithEntitiesById as getInvoiceDetailsById } from "services/invoiceService";
import { formatCurrency } from "utils/currencyHelper";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import Breadcrumb from "components/commonUI/Breadcrumb";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import BookingGeneralCharges from "components/bookings/booking-summary/BookingGeneralCharges";
import BookingFinancials from "components/bookings/booking-summary/BookingFinancials";
import { toast } from "react-toastify";
// import { INVOICE_TYPES_BY_ID } from "components/invoices/constants";
import { Margin, usePDF } from "react-to-pdf";
import classNames from "classnames";
import DOMPurify from "dompurify";
import "./InvoiceView.css";

const InvoiceView = () => {
  const [invoiceData, setInvoiceData] = useState({
    hotel: null,
    details: null,
  });
  const [loading, setLoading] = useState(true);
  const { hotelId, invoiceId } = useParams();
  const { toPDF, targetRef } = usePDF({
    filename: `CxC-${invoiceData?.details?.invoiceNumber}-${invoiceData?.details?.customer?.firstName}-${invoiceData?.details?.customer?.lastName}.pdf`,
    page: {
      margin: Margin.MEDIUM,
      page: "letter",
    },
  });

  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
  ];

  const sanitizedTerms = DOMPurify.sanitize(invoiceData?.details?.terms);

  useEffect(() => {
    if (!hotelId || !invoiceId) return;
    setLoading(true);
    Promise.allSettled([
      getHotelDetailsById(hotelId),
      getInvoiceDetailsById(invoiceId),
    ])
      .then(([hotelResult, invoiceResult]) => {
        const errors = [];

        if (hotelResult.status === "fulfilled") {
          setInvoiceData((prev) => ({
            ...prev,
            hotel: hotelResult.value.item,
          }));
        } else if (hotelResult.reason?.response?.status !== 404) {
          errors.push("Error al cargar el hotel");
        }

        if (invoiceResult.status === "fulfilled") {
          setInvoiceData((prev) => ({
            ...prev,
            details: invoiceResult.value.item,
          }));
        } else if (invoiceResult.reason?.response?.status !== 404) {
          errors.push("Error al cargar los detalles de la factura");
        }

        if (errors.length > 0) {
          toast.error(errors.join(" | "));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [hotelId, invoiceId]);

  return (
    <div>
      <Breadcrumb breadcrumbs={breadcrumbs} active={"Factura"} />
      <LoadingOverlay isVisible={loading} />
      <ErrorBoundary>
        <Button
          color="dark"
          className="no-print float-end mt-5"
          onClick={toPDF}>
          Descargar PDF
        </Button>
        <div ref={targetRef} className="w-75 mx-auto my-5">
          <Row>
            <Col className="text-center">
              <h2>{invoiceData?.hotel?.name}</h2>
              <span className="me-4">NIT: {invoiceData?.hotel?.taxId}</span>
              <span className="text-capitalize">
                {invoiceData?.hotel?.type}
              </span>
              <br />
              <span className="me-4">
                <FontAwesomeIcon className="me-2" icon={faLocationDot} />
                {invoiceData?.hotel?.address}
              </span>
              <br />
              <span className="me-4">
                <FontAwesomeIcon className="me-2" icon={faPhone} />
                {invoiceData?.hotel?.phone}
              </span>
              <span>
                <FontAwesomeIcon className="me-2" icon={faEnvelope} />
                {invoiceData?.hotel?.email}
              </span>
            </Col>
          </Row>
          <hr />
          {/* Invoice Information */}

          <Row className="mb-4">
            <h4 className="text-end mb-3">
              Cuenta de Cobro # {invoiceData?.details?.invoiceNumber}
            </h4>
            <Col className="border-end">
              <h5 className="text-start">Cliente</h5>
              <Row className="mb-3">
                <Col>
                  <Row>
                    <Col>
                      <span>
                        <strong>Nombre:</strong>
                        <p>
                          {invoiceData?.details?.customer?.firstName}{" "}
                          {invoiceData?.details?.customer?.lastName}
                        </p>
                      </span>
                    </Col>
                    <Col>
                      <span>
                        <strong>Documento:</strong>
                        <p>{invoiceData?.details?.customer?.documentNumber}</p>
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <span>
                        <strong>Email:</strong>
                        <p>{invoiceData?.details?.customer?.email}</p>
                      </span>
                    </Col>
                    <Col>
                      <span>
                        <strong>Teléfono:</strong>
                        <p>{invoiceData?.details?.customer?.phone}</p>
                      </span>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col>
              <Row className="mb-3">
                <h5>Detalles de la factura</h5>
                <Col>
                  <Row>
                    <Col>
                      <span>
                        <strong>Id Externa: </strong>
                        <p>{invoiceData?.details?.externalId || "N/A"}</p>
                      </span>
                    </Col>
                    <Col>
                      <span>
                        <strong>Fecha de emisión:</strong>
                        <p>{dayjs().format("DD-MM-YYYY")}</p>
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    {/* <Col>
                      <span>
                        <strong>Factura Matriz: </strong>
                        <p>{invoiceData?.details?.parentId || "N/A"}</p>
                      </span>
                    </Col>
                    <Col>
                      <span className="no-print">
                        <strong>Tipo: </strong>
                        <p>
                          {INVOICE_TYPES_BY_ID[invoiceData?.details?.typeId]}
                        </p>
                      </span>
                    </Col> */}
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>

          <hr />

          <div className="fs-5">
            <Row className="mb-2">
              <Col md={4}>
                <div className="line-item">
                  <span className="line-label fw-bold">Subtotal</span>
                  <div className="line-fill" />
                  <span className="line-amount">
                    {formatCurrency(invoiceData?.details?.subtotal, "COP")}
                  </span>
                </div>
              </Col>
              <Col md={4}>
                <div className="line-item">
                  <span className="line-label fw-bold">Cargos</span>
                  <div className="line-fill" />
                  <span className="line-amount">
                    {formatCurrency(invoiceData?.details?.charges, "COP")}
                  </span>
                </div>
              </Col>
              <Col md={4}>
                <div className="line-item">
                  <span className="line-label fw-bold">Total</span>
                  <div className="line-fill" />
                  <span className="line-amount">
                    {formatCurrency(invoiceData?.details?.total, "COP")}
                  </span>
                </div>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col md={4}>
                <div className="line-item">
                  <span className="line-label fw-bold">Total Pagado</span>
                  <div className="line-fill" />
                  <span className="line-amount">
                    {formatCurrency(invoiceData?.details?.paid, "COP")}
                  </span>
                </div>
              </Col>
              <Col md={4}>
                <div className="line-item">
                  <span className="line-label fw-bold">Saldo</span>
                  <div className="line-fill" />
                  <span
                    className={classNames("line-amount", {
                      "text-danger": invoiceData?.details?.balanceDue < 0,
                    })}>
                    {formatCurrency(invoiceData?.details?.balanceDue, "COP")}
                  </span>
                </div>
              </Col>
            </Row>
          </div>

          <hr />

          <h5 className="mb-4">Servicios ⬇️</h5>
          {invoiceData?.details?.bookings?.map((booking, index) => {
            const groupedRooms = groupRoomBookings(booking?.roomBookings);

            return (
              <Card
                id={`booking_${booking.id}-${index}`}
                key={`booking_${booking.id}-${index}`}
                className="mb-4 bg-body-tertiary shadow ">
                <CardHeader
                  tag="h5"
                  className="text-bg-dark text-center booking-card-header-print">
                  Concepto: Alojamiento -{" "}
                  <Link
                    to={`/hotels/${hotelId}/bookings/${booking.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-decoration-none booking-card-header-print">
                    Reserva # {booking?.id}
                  </Link>
                </CardHeader>
                <CardBody>
                  <Row className="mb-3 booking-card-content">
                    <Col>
                      <Row>
                        <Col>
                          <span>
                            <strong>Fecha de llegada:</strong>
                            <p>
                              {dayjs(booking.arrivalDate).format("DD/MM/YYYY")}
                            </p>
                          </span>
                        </Col>
                        <Col>
                          <span>
                            <strong>Fecha de Salida</strong>
                            <p>
                              {dayjs(booking.departureDate).format(
                                "DD/MM/YYYY"
                              )}
                            </p>
                          </span>
                        </Col>
                        <Col>
                          <span>
                            <strong>Número de Huespedes:</strong>
                            <p>
                              Adultos: {booking.adultGuests} - Niños:{" "}
                              {booking.childGuests || 0}
                            </p>
                          </span>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <hr />
                  <Row className="mb-3 booking-card-content">
                    <BookingGeneralCharges bookingData={booking} />
                    <h5>Totales de la reserva</h5>
                    <BookingFinancials
                      bookingData={booking}
                      isInvoiceView={true}
                    />
                    <hr />
                  </Row>

                  <h5>Habitaciones</h5>
                  <Row>
                    {groupedRooms.map((room, idx) => (
                      <Col
                        key={`${room.roomName}-${idx}`}
                        lg={6}
                        className="d-flex justify-content-center">
                        <RoomCard
                          room={room}
                          bookingNights={room.segments?.length || 0}
                          extraCharges={booking?.extraCharges}
                        />
                      </Col>
                    ))}
                  </Row>

                  <hr />
                  <Row className="mb-3 booking-card-content">
                    <Col>
                      <h5>Términos y Condiciones</h5>
                      <div
                        dangerouslySetInnerHTML={{ __html: sanitizedTerms }}
                      />
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default InvoiceView;
