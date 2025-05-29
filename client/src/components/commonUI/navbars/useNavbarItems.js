import {
  faHotel,
  faCalendarCheck,
  faClipboardList,
  faBed,
  faAddressCard,
  faUsers,
  faMoneyBillTrendUp,
} from "@fortawesome/free-solid-svg-icons";
import { useAppContext } from "contexts/GlobalAppContext";
import { HOTEL_ROLES_IDS } from "components/hotels/constants";

export const useNavbarItems = () => {
  const { hotel } = useAppContext();
  const isUserAdmin =
    hotel.current.roleId === HOTEL_ROLES_IDS.ADMIN ||
    hotel.current.roleId === HOTEL_ROLES_IDS.OWNER;

  const hotelsItems = [
    {
      name: "Alojamientos",
      icon: faHotel,
      capitalize: true,
      collapse: [
        {
          name: "Accesos directos",
          capitalize: true,
          collapse: [
            {
              name: "Invitaciones",
              path: "/hotels/invites",
              capitalize: true,
            },
            {
              name: "Lista de alojamientos",
              path: "/hotels",
              capitalize: true,
            },
            {
              name: "Registra un alojamiento",
              path: "/hotels/add",
              capitalize: true,
            },
          ],
        },
      ],
    },
  ];

  let currentHotelItems = [];

  if (hotel.current?.id) {
    currentHotelItems = [
      {
        name: "Reservas",
        icon: faClipboardList,
        position: "left",
        capitalize: true,
        collapse: [
          {
            name: "Accesos directos",
            capitalize: true,
            collapse: [
              {
                name: "Nueva Reserva",
                path: `/hotels/${hotel.current.id}/bookings/new`,
                capitalize: true,
              },
              {
                name: "Lista de Reservas",
                path: `/hotels/${hotel.current.id}/bookings`,
                capitalize: true,
              },
            ],
          },
        ],
      },
      {
        name: "Calendario",
        icon: faCalendarCheck,
        position: "left",
        path: `/hotels/${hotel.current.id}/calendar`,
        capitalize: true,
      },
      {
        name: "Gestionar Detalles",
        icon: faBed,
        position: "left",
        capitalize: true,
        collapse: [
          {
            name: "Alojamiento y Cargos",
            capitalize: true,
            collapse: [
              {
                name: "Habitaciones",
                path: `/hotels/${hotel.current.id}/rooms`,
                capitalize: true,
              },
              {
                name: "Cargos Extra",
                path: `/hotels/${hotel.current.id}/extra-charges`,
                capitalize: true,
              },
              {
                name: "Proveedores de Reservas",
                path: `/hotels/${hotel.current.id}/booking-providers`,
              },
            ],
          },

          {
            name: "Financieros",
            capitalize: true,
            collapse: [
              {
                name: "Metodos de Pago",
                path: `/hotels/${hotel.current.id}/payment-methods`,
                capitalize: true,
              },
              {
                name: "Subcategorias de Transacciones",
                path: `/hotels/${hotel.current.id}/transaction-subcategories`,
                capitalize: true,
              },
              {
                name: "Socios financieros",
                path: `/hotels/${hotel.current.id}/finance-partners`,
                capitalize: true,
              },
            ],
          },
        ],
      },

      {
        name: "Clientes",
        icon: faAddressCard,
        position: "left",
        path: `/hotels/${hotel.current.id}/customers`,
        capitalize: true,
      },
      ...(hotel.current.roleId === HOTEL_ROLES_IDS.OWNER
        ? [
            {
              name: "Personal",
              icon: faUsers,
              position: "left",
              path: `/hotels/${hotel.current.id}/staff`,
              capitalize: true,
            },
          ]
        : []),
      {
        name: "Finanzas",
        icon: faMoneyBillTrendUp,
        position: "left",
        capitalize: true,
        collapse: [
          {
            name: "Accesos directos",
            capitalize: true,
            collapse: [
              ...(isUserAdmin
                ? [
                    {
                      name: "Panel de Finanzas",
                      path: `/hotels/${hotel.current.id}/finances`,
                      capitalize: true,
                    },
                  ]
                : []),
              {
                name: "Transacciones",
                path: `/hotels/${hotel.current.id}/transactions`,
                capitalize: true,
              },
            ],
          },
        ],
      },
    ];
  }
  const items = [...currentHotelItems, ...hotelsItems];

  return {
    items,
  };
};
