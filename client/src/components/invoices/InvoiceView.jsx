import React from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Table,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import dayjs from "dayjs";
import {
  faPhone,
  faEnvelope,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const hotel = {
  name: "Cabaña Gaia 2",
  phone: "+573125644985",
  address: "CLL 454A # 4 - 456 Rodadero Santa Marta",
  email: "asdd.gasdia@gmail.com",
  taxId: "324234234-4",
};

const customer = {
  id: 1,
  documentNumber: "A12345678",
  firstName: "John",
  lastName: "Doe",
  phone: "123-456-7890",
  email: "john.doe@example.com",
};

const invoice = {
  invoiceNumber: "INV-20250523-0001",
  externalId: null,
  parentId: null,
  type: "reservation",
  locked: false,
  dateCreated: "2025-05-23",
  dateModified: "2025-05-23",
  createdBy: "admin",
  modifiedBy: "admin",
  subtotal: 180000,
  charges: 20000,
  total: 200000,
  paid: 150000,
  balanceDue: 50000,
};

const bookings = [
  {
    arrivalDate: "2025-05-19",
    departureDate: "2025-05-22",
    adultGuests: 4,
    childGuests: 0,
    roomBookings: [
      {
        roomName: "My full stack room4",
        subtotal: 180000,
        charges: [
          {
            name: "Cleaning fee",
            price: 20000,
          },
          {
            name: "Daily fee",
            price: 30000,
          },
        ],
        segments: [
          {
            date: "2025-05-19",
            price: 60000,
          },
          {
            date: "2025-05-20",
            price: 60000,
          },
          {
            date: "2025-05-21",
            price: 60000,
          },
        ],
      },
      {
        roomName: "My full stack room4",
        subtotal: 180000,
        charges: [
          {
            name: "Cleaning fee",
            price: 20000,
          },
          {
            name: "Daily fee",
            price: 30000,
          },
        ],
        segments: [
          {
            date: "2025-05-19",
            price: 60000,
          },
          {
            date: "2025-05-20",
            price: 60000,
          },
          {
            date: "2025-05-21",
            price: 60000,
          },
        ],
      },
    ],
  },
  {
    arrivalDate: "2025-05-19",
    departureDate: "2025-05-22",
    adultGuests: 4,
    childGuests: 0,
    roomBookings: [
      {
        roomName: "My full stack room4",
        subtotal: 180000,
        charges: [
          {
            name: "Cleaning fee",
            price: 20000,
          },
          {
            name: "Daily fee",
            price: 30000,
          },
        ],
        segments: [
          {
            date: "2025-05-19",
            price: 60000,
          },
          {
            date: "2025-05-20",
            price: 60000,
          },
          {
            date: "2025-05-21",
            price: 60000,
          },
        ],
      },
      {
        roomName: "My full stack room4",
        subtotal: 180000,
        charges: [
          {
            name: "Cleaning fee",
            price: 20000,
          },
          {
            name: "Daily fee",
            price: 30000,
          },
        ],
        segments: [
          {
            date: "2025-05-19",
            price: 60000,
          },
          {
            date: "2025-05-20",
            price: 60000,
          },
          {
            date: "2025-05-21",
            price: 60000,
          },
        ],
      },
    ],
  },
];

const InvoiceView = () => {
  const formattedDate = dayjs().format("DD-MM-YYYY");

  const calculateRoomTotal = (room) => {
    const segmentTotal = room.segments.reduce((sum, seg) => sum + seg.price, 0);
    const chargesTotal = room.charges.reduce(
      (sum, charge) => sum + charge.price,
      0
    );
    return segmentTotal + chargesTotal;
  };

  return (
    <div className="my-4">
      {/* Hotel Information */}
      <Row>
        <Col className="text-center">
          <h1>{hotel.name}</h1>
          <span className="me-4">NIT: {hotel.taxId}</span>
          <span>
            <FontAwesomeIcon className="me-2" icon={faLocationDot} />
            {hotel.address}
          </span>
          <br />
          <span className="me-4">
            <FontAwesomeIcon className="me-2" icon={faPhone} />
            {hotel.phone}
          </span>
          <span>
            <FontAwesomeIcon className="me-2" icon={faEnvelope} />
            {hotel.email}
          </span>
        </Col>
      </Row>
      <hr />
      {/* Invoice Information */}

      <Row className="mb-4">
        <h4 className="text-end mb-3">Recibo # {invoice.invoiceNumber}</h4>
        <Col className="border-end">
          <h5 className="text-start">Cliente</h5>
          <Row className="mb-3">
            <Col>
              <Row>
                <Col>
                  <span>
                    <strong>Nombre:</strong>
                    <p>
                      {customer.firstName} {customer.lastName}
                    </p>
                  </span>
                </Col>
                <Col>
                  <span>
                    <strong>Documento:</strong>
                    <p>{customer.documentNumber}</p>
                  </span>
                </Col>
              </Row>
              <Row>
                <Col>
                  <span>
                    <strong>Email:</strong>
                    <p>{customer.email}</p>
                  </span>
                </Col>
                <Col>
                  <span>
                    <strong>Teléfono:</strong>
                    <p>{customer.phone}</p>
                  </span>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
        <Col>
          <Row className="mb-3">
            <h5>Detalles del recibo</h5>
            <Col>
              <Row>
                <Col>
                  <span>
                    <strong>Id Externa: </strong>
                    <p>{invoice.externalId || "N/A"}</p>
                  </span>
                </Col>
                <Col>
                  <span>
                    <strong>Fecha de emisión:</strong>
                    <p>{formattedDate}</p>
                  </span>
                </Col>
              </Row>
              <Row>
                <Col>
                  <span>
                    <strong>Recibo Matriz: </strong>
                    <p>{invoice.parentId || "N/A"}</p>
                  </span>
                </Col>
                <Col>
                  <span>
                    <strong>Tipo: </strong>
                    <p>{invoice.type}</p>
                  </span>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Booking Details */}
      {bookings.map((booking, index) => (
        <Card className="mb-4" key={index}>
          <CardHeader>
            <strong>Booking {index + 1}</strong>
          </CardHeader>
          <CardBody>
            <Row>
              <Col md={4}>
                <p>
                  <strong>Arrival:</strong>{" "}
                  {dayjs(booking.arrivalDate).format("DD-MM-YYYY")}
                </p>
                <p>
                  <strong>Departure:</strong>{" "}
                  {dayjs(booking.departureDate).format("DD-MM-YYYY")}
                </p>
              </Col>
              <Col md={4}>
                <p>
                  <strong>Adults:</strong> {booking.adultGuests}
                </p>
                <p>
                  <strong>Children:</strong> {booking.childGuests}
                </p>
              </Col>
            </Row>

            {/* Room Bookings */}
            {booking.roomBookings.map((room, rIndex) => (
              <Card className="mb-3" key={rIndex}>
                <CardHeader>
                  <strong>{room.roomName}</strong>
                </CardHeader>
                <CardBody>
                  {/* Nightly Breakdown */}
                  <h6>Nightly Rates:</h6>
                  <Table bordered size="sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {room.segments.map((segment, sIndex) => (
                        <tr key={sIndex}>
                          <td>{dayjs(segment.date).format("DD-MM-YYYY")}</td>
                          <td>{segment.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Charges */}
                  <h6>Additional Charges:</h6>
                  <ListGroup>
                    {room.charges.map((charge, cIndex) => (
                      <ListGroupItem key={cIndex}>
                        {charge.name}: {charge.price}
                      </ListGroupItem>
                    ))}
                  </ListGroup>

                  {/* Subtotal */}
                  <p className="mt-2">
                    <strong>Room Total:</strong> {calculateRoomTotal(room)}
                  </p>
                </CardBody>
              </Card>
            ))}
          </CardBody>
        </Card>
      ))}
      {/* Invoice Totals */}
      <Row className="mt-4">
        <Col md={6}>
          <h5>Invoice Summary</h5>
          <Table bordered>
            <tbody>
              <tr>
                <th>Subtotal</th>
                <td>{invoice.subtotal}</td>
              </tr>
              <tr>
                <th>Charges</th>
                <td>{invoice.charges}</td>
              </tr>
              <tr>
                <th>Total</th>
                <td>{invoice.total}</td>
              </tr>
              <tr>
                <th>Paid</th>
                <td>{invoice.paid}</td>
              </tr>
              <tr>
                <th>Balance Due</th>
                <td>{invoice.balanceDue}</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </div>
  );
};

export default InvoiceView;
