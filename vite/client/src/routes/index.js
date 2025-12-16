import { publicRoutes } from "./publicRoutes";
import { privateRoutes } from "./privateRoutes";

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

const publicFlattenedRoutes = flattenRoutes([...publicRoutes]);
const privateFlattenedRoutes = flattenRoutes([...privateRoutes]);

export { publicFlattenedRoutes, privateFlattenedRoutes };
