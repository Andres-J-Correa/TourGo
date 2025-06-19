import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAll } from "services/hotelService";
import { Row, Col, Card, CardBody } from "reactstrap";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import Breadcrumb from "components/commonUI/Breadcrumb";
import { toast } from "react-toastify";
import { LazyLoadImage } from "react-lazy-load-image-component";
import HotelDefaultImage from "assets/images/default-hotel.jpg"; // Adjust the path as necessary
import "./hotelsview.css";
import { useLanguage } from "contexts/LanguageContext"; // added

const HotelsView = () => {
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage(); // added

  const breadcrumbs = [{ label: t("hotels.breadcrumbs.home"), path: "/" }];

  const fetchHotels = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getAll();
      if (res.isSuccessful) {
        setHotels(res.items);
      }
    } catch (error) {
      if (error?.response?.status !== 404) {
        toast.error(t("hotels.view.loadError"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const handleCardClick = (id) => {
    navigate(`/hotels/${id}`);
  };

  return (
    <>
      <Breadcrumb
        breadcrumbs={breadcrumbs}
        active={t("hotels.breadcrumbs.hotels")}
      />
      <LoadingOverlay isVisible={isLoading} message={t("common.loading")} />
      <ErrorBoundary>
        <Row>
          {hotels.length > 0 ? (
            hotels.map((hotel) => (
              <Col key={hotel.id} xs="12" sm="6" md="4" lg="3" className="mb-3">
                <Card
                  className="hotel-card shadow bg-dark text-white"
                  onClick={() => handleCardClick(hotel.id)}
                  role="button">
                  <LazyLoadImage
                    src={hotel.imageUrl || HotelDefaultImage}
                    alt={hotel.name}
                    className="img-fluid rounded-top"
                    effect="blur"
                    height={"auto"}
                    wrapperClassName="rounded-top"
                  />
                  <CardBody className="text-center p-3">
                    <div>{hotel.name}</div>
                  </CardBody>
                </Card>
              </Col>
            ))
          ) : (
            <Col xs="12" className="text-center">
              <h5>{t("hotels.view.noHotels")}</h5>
              <Link to="/hotels/add" className="btn btn-dark mt-3">
                {t("hotels.view.addHotel")}
              </Link>
            </Col>
          )}
        </Row>
      </ErrorBoundary>
    </>
  );
};

export default HotelsView;
