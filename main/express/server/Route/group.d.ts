import RouteMiddleware from "./middleware";

/**
 * Represents a group of routes with associated middlewares and naming.
 */
declare class RouteGroup {
  /**
   * Array to hold the route group's name (as aliases).
   * @private
   */
  #as: string[];

  /**
   * Array to hold the middlewares for this route group.
   * @private
   */
  #middlewares: RouteMiddleware[];

  /**
   * Parent route group (if any).
   * @private
   */
  #parent: RouteGroup[];

  /**
   * Holds the child routes for different HTTP methods.
   * @private
   */
  #childRoutes: {
    get: string[];
    post: string[];
    options: string[];
    put: string[];
    delete: string[];
    head: string[];
    patch: string[];
    all: string[];
  };

  /**
   * Creates an instance of RouteGroup.
   * @param {Object} config Configuration options for the route group.
   * @param {string|null} config.as The alias for the route group (optional).
   * @param {RouteMiddleware | Array<RouteMiddleware>} config.middleware Middlewares to be applied to the group.
   */
  constructor(config?: {
    as?: string | null;
    middleware?: RouteMiddleware | Array<RouteMiddleware>;
  });

  /**
   * Adds an alias to the route group.
   * @param {string} name The alias to assign to the route group.
   * @private
   * @returns {RouteGroup} The instance of the RouteGroup.
   */
  #name(name: string): RouteGroup;

  /**
   * Adds middleware to the route group.
   * @param {RouteMiddleware | Array<RouteMiddleware>} handler Middleware or array of middleware to add.
   * @private
   * @returns {RouteGroup} The instance of the RouteGroup.
   */
  #middleware(handler: RouteMiddleware | Array<RouteMiddleware>): RouteGroup;

  /**
   * Gets the current configuration of the route group, including its name, middlewares, and child routes.
   * @returns {Object} The configuration of the route group.
   * @returns {string[]} as The aliases of the route group.
   * @returns {RouteMiddleware[]} middlewares The middlewares assigned to the route group.
   * @returns {Object} childRoutes The child routes for the HTTP methods.
   */
  getGroup(): {
    as: string[];
    middlewares: RouteMiddleware[];
    childRoutes: {
      get: string[];
      post: string[];
      options: string[];
      put: string[];
      delete: string[];
      head: string[];
      patch: string[];
      all: string[];
    };
  };

  /**
   * Adds a route ID to the specified HTTP method's child routes.
   * @param {string} method The HTTP method (e.g., 'get', 'post').
   * @param {string} id The ID of the route to add.
   */
  pushRoute(
    method:
      | "get"
      | "post"
      | "options"
      | "put"
      | "delete"
      | "head"
      | "patch"
      | "all",
    id: string
  ): void;
}

export = RouteGroup;
