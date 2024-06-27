import { publicRoutes } from "./publicRoutes";

// flatten the list of all nested routes
const flattenRoutes = (routes) => {
  let flatRoutes = [];

  routes = routes || [];
  routes.forEach((item) => {
    if (item.path !== undefined) {
      flatRoutes.push(item);
    }
    if (typeof item.collapse !== "undefined") {
      flatRoutes = [...flatRoutes, ...flattenRoutes(item.collapse)];
    }
  });
  return flatRoutes;
};

// const authProtectedFlattenRoutes = flattenRoutes([...securedRoutes]);
const publicFlattenedRoutes = flattenRoutes([...publicRoutes]);
export { /*authProtectedFlattenRoutes, */ publicFlattenedRoutes };
