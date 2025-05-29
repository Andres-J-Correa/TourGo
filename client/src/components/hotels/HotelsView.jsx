import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAll } from "services/hotelService";
import { Row, Col, Card } from "reactstrap";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import Breadcrumb from "components/commonUI/Breadcrumb";
import { toast } from "react-toastify";
import "./hotelsview.css";

const breadcrumbs = [{ label: "Inicio", path: "/" }];

const HotelsView = () => {
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchHotels = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getAll();
      if (res.isSuccessful) {
        setHotels(res.items);
      }
    } catch (error) {
      if (error?.response?.status !== 404) {
        toast.error("Hubo un error al cargar los hoteles");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const handleCardClick = (id) => {
    navigate(`/hotels/${id}`);
  };

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} active="Hoteles" />
      <LoadingOverlay isVisible={isLoading} message="Cargando..." />
      <Row>
        {hotels.length > 0 ? (
          hotels.map((hotel) => (
            <Col key={hotel.id} xs="12" sm="6" md="4" lg="3" className="mb-3">
              <Card
                className="p-3 text-center hotel-card shadow bg-dark text-white"
                onClick={() => handleCardClick(hotel.id)}
                role="button">
                {hotel.name}
              </Card>
            </Col>
          ))
        ) : (
          <Col xs="12" className="text-center">
            <h5>No hay hoteles disponibles</h5>
            <p>
              Ve a la sección de "Alojamientos" en el menú superior para ver tus
              invitaciones pendientes o agregar nuevos hoteles.
            </p>
          </Col>
        )}
      </Row>
    </>
  );
};

export default HotelsView;
