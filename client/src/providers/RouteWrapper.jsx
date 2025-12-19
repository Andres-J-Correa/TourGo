import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "contexts/GlobalAppContext";

function RouteWrapper({ children }) {
  const { hotelId } = useParams();
  const { hotel } = useAppContext();

  useEffect(() => {
    hotel.setHotelId(hotelId);
  }, [hotelId, hotel]);

  return <>{children}</>;
}

export default RouteWrapper;
