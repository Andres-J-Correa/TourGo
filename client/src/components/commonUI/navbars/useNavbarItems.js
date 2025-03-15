import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHotel } from "@fortawesome/free-solid-svg-icons";
import { useAppContext } from "contexts/GlobalAppContext";

export const useNavbarItems = () => {
  const { user } = useAppContext();

  const withHotelItems = [
    {
      name: user.current?.hotel?.name,
      icon: <FontAwesomeIcon icon={faHotel} className="icon" />,
      main: true,
      capitalize: true,
      collapse: [
        {
          name: "Paginas",
          capitalize: true,
          collapse: [
            {
              name: "Inicio",
              path: "/hotel/home",
              capitalize: true,
            },
            {
              name: "Reservas",
              path: "/hotel/reservations",
              capitalize: true,
            },
          ],
        },
      ],
    },
  ];

  const withoutHotelItems = [
    {
      name: "Alojamiento",
      icon: <FontAwesomeIcon icon={faHotel} className="icon" />,
      main: true,
      capitalize: true,
      collapse: [
        {
          name: "Paginas",
          capitalize: true,
          collapse: [
            {
              name: "Registra un alojamiento",
              path: "/hotels/register",
              capitalize: true,
              isAnonymous: true,
            },
            {
              name: "Solictud de acceso a un alojamiento",
              path: "/hotels/access-request",
              capitalize: true,
              isAnonymous: true,
            },
          ],
        },
      ],
    },
  ];

  const items = [
    ...(user.current?.hotel?.id ? withHotelItems : withoutHotelItems),
  ];

  return {
    items,
  };
};
