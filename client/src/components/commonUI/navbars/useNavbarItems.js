import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHotel } from "@fortawesome/free-solid-svg-icons";

export const useNavbarItems = () => {
  const hotelItems = [
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
              path: "/hotels/add",
              capitalize: true,
            },
            {
              name: "Lista de alojamientos",
              path: "/hotels",
              capitalize: true,
            },
          ],
        },
      ],
    },
  ];

  const items = [...hotelItems];

  return {
    items,
  };
};
