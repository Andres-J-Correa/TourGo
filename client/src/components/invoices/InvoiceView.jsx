import React, { useState, useEffect, useMemo } from "react";
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
import { useLanguage } from "contexts/LanguageContext"; // added

const InvoiceView = () => {
  const [invoiceData, setInvoiceData] = useState({
    hotel: null,
    details: null,
  });
  const [loading, setLoading] = useState(true);
  const { hotelId, invoiceId } = useParams();
  const { toPDF, targetRef } = usePDF({
    filename: `CxC-${invoiceData?.details?.id}-${invoiceData?.details?.customer?.firstName}-${invoiceData?.details?.customer?.lastName}.pdf`,
    page: {
      margin: Margin.MEDIUM,
      page: "letter",
    },
  });

  const { t } = useLanguage(); // added

  const breadcrumbs = [
    { label: t("invoices.view.breadcrumbs.home"), path: "/" },
    { label: t("invoices.view.breadcrumbs.hotels"), path: "/hotels" },
    { label: t("invoices.view.breadcrumbs.hotel"), path: `/hotels/${hotelId}` },
  ];

  const sanitizedTerms = useMemo(() => {
    return (
      DOMPurify.sanitize(invoiceData?.details?.terms) ||
      `<p>${t("invoices.view.noTerms")}</p>`
    );
  }, [invoiceData?.details?.terms, t]);

  useEffect(() => {
    if (!hotelId || !invoiceId) return;
    setLoading(true);
    Promise.allSettled([
      getHotelDetailsById(hotelId),
      getInvoiceDetailsById(invoiceId, hotelId),
    ])
      .then(([hotelResult, invoiceResult]) => {
        const errors = [];

        if (hotelResult.status === "fulfilled") {
          setInvoiceData((prev) => ({
            ...prev,
            hotel: hotelResult.value.item,
          }));
        } else if (hotelResult.reason?.response?.status !== 404) {
          errors.push(t("invoices.view.loadHotelError"));
        }

        if (invoiceResult.status === "fulfilled") {
          setInvoiceData((prev) => ({
            ...prev,
            details: invoiceResult.value.item,
          }));
        } else if (invoiceResult.reason?.response?.status !== 404) {
          errors.push(t("invoices.view.loadInvoiceError"));
        }

        if (errors.length > 0) {
          toast.error(errors.join(" | "));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [hotelId, invoiceId, t]);

  return (
    <div>
      <Breadcrumb
        breadcrumbs={breadcrumbs}
        active={t("invoices.view.breadcrumbActive")}
      />
      <LoadingOverlay isVisible={loading} />
      <ErrorBoundary>
        <Button
          color="dark"
          className="no-print float-end mt-5"
          onClick={toPDF}>
          {t("invoices.view.downloadPDF")}
        </Button>
        <div ref={targetRef} className="w-75 mx-auto my-5">
          <Row>
            <Col className="text-center">
              <h2>{invoiceData?.hotel?.name}</h2>
              <span className="me-4">
                {t("invoices.view.nit")}: {invoiceData?.hotel?.taxId}
              </span>
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
              {t("invoices.view.invoiceNumber")} {invoiceData?.details?.id}
            </h4>
            <Col className="border-end">
              <h5 className="text-start">{t("invoices.view.customer")}</h5>
              <Row className="mb-3">
                <Col>
                  <Row>
                    <Col>
                      <span>
                        <strong>{t("invoices.view.name")}</strong>
                        <p>
                          {invoiceData?.details?.customer?.firstName}{" "}
                          {invoiceData?.details?.customer?.lastName}
                        </p>
                      </span>
                    </Col>
                    <Col>
                      <span>
                        <strong>{t("invoices.view.document")}</strong>
                        <p>{invoiceData?.details?.customer?.documentNumber}</p>
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <span>
                        <strong>{t("invoices.view.email")}</strong>
                        <p>{invoiceData?.details?.customer?.email}</p>
                      </span>
                    </Col>
                    <Col>
                      <span>
                        <strong>{t("invoices.view.phone")}</strong>
                        <p>{invoiceData?.details?.customer?.phone}</p>
                      </span>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col>
              <Row className="mb-3">
                <h5>{t("invoices.view.invoiceDetails")}</h5>
                <Col>
                  <Row>
                    <Col>
                      <span>
                        <strong>{t("invoices.view.externalId")}</strong>
                        <p>{invoiceData?.details?.externalId || "N/A"}</p>
                      </span>
                    </Col>
                    <Col>
                      <span>
                        <strong>{t("invoices.view.issueDate")}</strong>
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
                  <span className="line-label fw-bold">
                    {t("invoices.view.subtotal")}
                  </span>
                  <div className="line-fill" />
                  <span className="line-amount">
                    {formatCurrency(invoiceData?.details?.subtotal, "COP")}
                  </span>
                </div>
              </Col>
              <Col md={4}>
                <div className="line-item">
                  <span className="line-label fw-bold">
                    {t("invoices.view.charges")}
                  </span>
                  <div className="line-fill" />
                  <span className="line-amount">
                    {formatCurrency(invoiceData?.details?.charges, "COP")}
                  </span>
                </div>
              </Col>
              <Col md={4}>
                <div className="line-item">
                  <span className="line-label fw-bold">
                    {t("invoices.view.total")}
                  </span>
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
                  <span className="line-label fw-bold">
                    {t("invoices.view.totalPaid")}
                  </span>
                  <div className="line-fill" />
                  <span className="line-amount">
                    {formatCurrency(invoiceData?.details?.paid, "COP")}
                  </span>
                </div>
              </Col>
              <Col md={4}>
                <div className="line-item">
                  <span className="line-label fw-bold">
                    {t("invoices.view.balance")}
                  </span>
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

          <h5 className="mb-4">{t("invoices.view.services")}</h5>
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
                  {t("invoices.view.conceptAccommodation")}{" "}
                  <Link
                    to={`/hotels/${hotelId}/bookings/${booking.id}`}
                    className="text-white text-decoration-none booking-card-header-print">
                    {t("invoices.view.bookingNumber", { id: booking?.id })}
                  </Link>
                </CardHeader>
                <CardBody>
                  <Row className="mb-3 booking-card-content">
                    <Col>
                      <Row>
                        <Col>
                          <span>
                            <strong>{t("invoices.view.arrivalDate")}</strong>
                            <p>
                              {dayjs(booking.arrivalDate).format("DD/MM/YYYY")}
                            </p>
                          </span>
                        </Col>
                        <Col>
                          <span>
                            <strong>{t("invoices.view.departureDate")}</strong>
                            <p>
                              {dayjs(booking.departureDate).format(
                                "DD/MM/YYYY"
                              )}
                            </p>
                          </span>
                        </Col>
                        <Col>
                          <span>
                            <strong>{t("invoices.view.guestCount")}</strong>
                            <p>
                              {t("invoices.view.adults")}: {booking.adultGuests}{" "}
                              - {t("invoices.view.children")}:{" "}
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
                    <h5>{t("invoices.view.bookingTotals")}</h5>
                    <BookingFinancials
                      bookingData={booking}
                      isInvoiceView={true}
                    />
                    <hr />
                  </Row>

                  <h5>{t("invoices.view.rooms")}</h5>
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
                      <h5>{t("invoices.view.termsTitle")}</h5>
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
