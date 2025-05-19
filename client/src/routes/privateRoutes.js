import { lazy } from "react";

const hotelRoutes = [
  {
    name: "hotelAccessRequest",
    path: "/hotels/accept-invite/:token",
    component: lazy(() => import("components/hotels/HotelAcceptInvite")),
  },
  {
    name: "hotelsView",
    path: "/hotels",
    component: lazy(() => import("components/hotels/HotelsView")),
  },
  {
    name: "hotelLandingPage",
    path: "/hotels/:hotelId",
    component: lazy(() => import("components/hotels/HotelLandingPage")),
  },
  {
    name: "hotelEdit",
    path: "/hotels/:hotelId/edit",
    component: lazy(() => import("components/hotels/HotelEdit")),
  },
  {
    name: "hotelAdd",
    path: "/hotels/add",
    component: lazy(() => import("components/hotels/HotelAdd")),
  },
  {
    name: "calendar",
    path: "/hotels/:hotelId/calendar",
    component: lazy(() => import("components/bookings/calendar/CalendarView")),
  },
  {
    name: "customer",
    path: "/hotels/:hotelId/customers",
    component: lazy(() =>
      import("components/commonUI/fallback/SiteUnderConstruction")
    ),
  },
  {
    name: "staff",
    path: "/hotels/:hotelId/staff",
    component: lazy(() =>
      import("components/commonUI/fallback/SiteUnderConstruction")
    ),
  },
  {
    name: "paymentMethods",
    path: "/hotels/:hotelId/payment-methods",
    component: lazy(() =>
      import("components/commonUI/fallback/SiteUnderConstruction")
    ),
  },
  {
    name: "financialPartners",
    path: "/hotels/:hotelId/financial-partners",
    component: lazy(() =>
      import("components/commonUI/fallback/SiteUnderConstruction")
    ),
  },
];

const roomRoutes = [
  {
    name: "roomsView",
    path: "/hotels/:hotelId/rooms",
    component: lazy(() => import("components/rooms/RoomsView")),
  },
];

const extraCharges = [
  {
    name: "extraChargesView",
    path: "/hotels/:hotelId/extra-charges",
    component: lazy(() => import("components/extra-charges/ExtraChargesView")),
  },
];

const bookings = [
  {
    name: "bookingsView",
    path: "/hotels/:hotelId/bookings",
    component: lazy(() =>
      import("components/bookings/bookings-view/BookingsView")
    ),
  },
  {
    name: "newBooking",
    path: "/hotels/:hotelId/bookings/new",
    component: lazy(() =>
      import("components/bookings/booking-add-edit-view/BookingAddUpdateView")
    ),
  },
  {
    name: "editBooking",
    path: "/hotels/:hotelId/bookings/:bookingId/edit",
    component: lazy(() =>
      import("components/bookings/booking-add-edit-view/BookingAddUpdateView")
    ),
  },
  {
    name: "viewBooking",
    path: "/hotels/:hotelId/bookings/:bookingId",
    component: lazy(() => import("components/bookings/BookingView")),
  },
];

const finances = [
  {
    name: "financesView",
    path: "/hotels/:hotelId/finances",
    component: lazy(() =>
      import("components/commonUI/fallback/SiteUnderConstruction")
    ),
  },
];

const transactionSubCategories = [
  {
    name: "transactionSubCategoriesView",
    path: "/hotels/:hotelId/transaction-subcategories",
    component: lazy(() =>
      import(
        "components/transactions/subcategories/TransactionSubcategoriesView"
      )
    ),
  },
];

export const privateRoutes = [
  ...hotelRoutes,
  ...roomRoutes,
  ...extraCharges,
  ...bookings,
  ...finances,
  ...transactionSubCategories,
];
