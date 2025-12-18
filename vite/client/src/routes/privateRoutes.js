import { lazy } from "react";

const hotelRoutes = [
  {
    name: "hotelsView",
    path: "/hotels",
    component: lazy(() => import("components/hotels/HotelsView")),
  },
  {
    name: "hotelLandingPage",
    path: "/hotels/:hotelId",
    component: lazy(() => import("components/hotels/LandingPage")),
  },
  {
    name: "hotelSettings",
    path: "/hotels/:hotelId/settings",
    component: lazy(() => import("components/hotels/HotelSettings")),
  },
  {
    name: "hotelAdd",
    path: "/hotels/add",
    component: lazy(() => import("components/hotels/HotelAdd")),
  },
  {
    name: "calendar",
    path: "/hotels/:hotelId/calendar",
    component: lazy(() =>
      import("components/bookings/calendarV2/CalendarView")
    ),
  },
  //   {
  //     name: "customer",
  //     path: "/hotels/:hotelId/customers",
  //     component: lazy(() =>
  //       import("components/commonUI/fallback/SiteUnderConstruction")
  //     ),
  //   },
  //   {
  //     name: "staff",
  //     path: "/hotels/:hotelId/staff",
  //     component: lazy(() => import("components/staff/StaffView")),
  //   },
  //   {
  //     name: "paymentMethods",
  //     path: "/hotels/:hotelId/payment-methods",
  //     component: lazy(() =>
  //       import("components/transactions/payment-methods/PaymentMethodsView")
  //     ),
  //   },
  //   {
  //     name: "financePartners",
  //     path: "/hotels/:hotelId/finance-partners",
  //     component: lazy(() =>
  //       import("components/transactions/finance-partners/FinancePartnersView")
  //     ),
  //   },
  //   {
  //     name: "bookingProviders",
  //     path: "/hotels/:hotelId/booking-providers",
  //     component: lazy(() => import("components/bookings/BookingProvidersView")),
  //   },
];

// const roomRoutes = [
//   {
//     name: "roomsView",
//     path: "/hotels/:hotelId/rooms",
//     component: lazy(() => import("components/rooms/RoomsView")),
//   },
// ];

// const extraCharges = [
//   {
//     name: "extraChargesView",
//     path: "/hotels/:hotelId/extra-charges",
//     component: lazy(() => import("components/extra-charges/ExtraChargesView")),
//   },
// ];

// const bookings = [
//   {
//     name: "bookingsView",
//     path: "/hotels/:hotelId/bookings",
//     component: lazy(() =>
//       import("components/bookings/bookings-view/BookingsViewV2")
//     ),
//   },
//   {
//     name: "newBooking",
//     path: "/hotels/:hotelId/bookings/new",
//     component: lazy(() =>
//       import("components/bookings/booking-add-edit-view/BookingAddUpdateView")
//     ),
//   },
//   {
//     name: "editBooking",
//     path: "/hotels/:hotelId/bookings/:bookingId/edit",
//     component: lazy(() =>
//       import("components/bookings/booking-add-edit-view/BookingAddUpdateView")
//     ),
//   },
//   {
//     name: "newBooking",
//     path: "/hotels/:hotelId/bookings/newV2",
//     component: lazy(() =>
//       import("components/bookings/booking-add-edit-view-v2/BookingAddEditView")
//     ),
//   },
//   {
//     name: "quoteBooking",
//     path: "/hotels/:hotelId/bookings/quote",
//     component: lazy(() =>
//       import("components/bookings/booking-quote-view/BookingQuoteView")
//     ),
//   },
//   {
//     name: "viewBooking",
//     path: "/hotels/:hotelId/bookings/:bookingId",
//     component: lazy(() => import("components/bookings/BookingView")),
//   },
// ];

// const finances = [
//   {
//     name: "financeDashboard",
//     path: "/hotels/:hotelId/finance-dashboard",
//     component: lazy(() =>
//       import("components/financial-reports/FinanceDashboard")
//     ),
//   },
//   {
//     name: "transactionsView",
//     path: "/hotels/:hotelId/transactions",
//     component: lazy(() =>
//       import("components/transactions/transactions-view/TransactionsView")
//     ),
//   },
//   {
//     name: "invoiceView",
//     path: "/hotels/:hotelId/invoices/:invoiceId",
//     component: lazy(() => import("components/invoices/InvoiceView")),
//   },
// ];

// const transactionSubCategories = [
//   {
//     name: "transactionSubCategoriesView",
//     path: "/hotels/:hotelId/transaction-subcategories",
//     component: lazy(() =>
//       import(
//         "components/transactions/subcategories/TransactionSubcategoriesView"
//       )
//     ),
//   },
// ];

// const userRoutes = [
//   {
//     name: "userSettings",
//     path: "/profile/settings",
//     component: lazy(() => import("components/users/UserSettings")),
//   },
//   {
//     name: "userProfile",
//     path: "/profile",
//     component: lazy(() => import("components/users/UserProfile")),
//   },
// ];

// export const privateRoutes = [
//   ...userRoutes,
//   ...hotelRoutes,
//   ...roomRoutes,
//   ...extraCharges,
//   ...bookings,
//   ...finances,
//   ...transactionSubCategories,
// ];

export const privateRoutes = [...hotelRoutes];
