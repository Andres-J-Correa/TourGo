import {
  faHotel,
  faCalendarCheck,
  faClipboardList,
  faBed,
  faUsers,
  faCashRegister,
  faCogs,
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
      name: "Hoteles",
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
              name: "Lista de Hoteles",
              path: "/hotels",
            },
            {
              name: "Registra un Hotel",
              path: "/hotels/add",
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
                newTab: true,
              },
              {
                name: "Lista de Reservas",
                path: `/hotels/${hotel.current.id}/bookings`,
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
        name: "Transacciones",
        icon: faCashRegister,
        position: "left",
        path: `/hotels/${hotel.current.id}/transactions`,
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
              },
              {
                name: "Subcategorias de Transacciones",
                path: `/hotels/${hotel.current.id}/transaction-subcategories`,
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
      ...(isUserAdmin
        ? [
            {
              name: "Administración",
              icon: faCogs,
              position: "left",
              capitalize: true,
              collapse: [
                {
                  name: "Accesos directos",
                  capitalize: true,
                  collapse: [
                    {
                      name: "Editar Alojamiento",
                      path: `/hotels/${hotel.current.id}/edit`,
                      capitalize: true,
                    },
                  ],
                },
                {
                  name: "Finanzas",
                  capitalize: true,
                  collapse: [
                    {
                      name: "Panel de Finanzas",
                      path: `/hotels/${hotel.current.id}/finance-dashboard`,
                    },
                  ],
                },
              ],
            },
          ]
        : []),
    ];
  }
  const items = [...currentHotelItems, ...hotelsItems];

  return {
    items,
  };
};
