import { publicRoutes } from "./publicRoutes";

// flatten the list of all nested routes
const flattenRoutes = (routes) => {
  let flatRoutes = [];

  routes = routes || [];
  routes.forEach((item) => {
    if (Boolean(item.path) && Boolean(item.component)) {
      flatRoutes.push(item);
    }
    if (typeof item.subRoutes !== "undefined") {
      flatRoutes = [...flatRoutes, ...flattenRoutes(item.subRoutes)];
    }
  });
  return flatRoutes;
};

// const authProtectedFlattenRoutes = flattenRoutes([...securedRoutes]);
const publicFlattenedRoutes = flattenRoutes([...publicRoutes]);
export { /*authProtectedFlattenRoutes, */ publicFlattenedRoutes };
