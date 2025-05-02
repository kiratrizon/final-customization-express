/**
 * Represents a method for defining routes and handling HTTP requests.
 */
declare class RouteMethod {
  /**
   * Data about the route, including method, path, callback, middlewares, and other properties.
   * @private
   */
  private routeData: {
    internal_middlewares: Function[];
    regex: object;
    as: string | null;
    match: string[] | null;
  };

  /**
   * Creates an instance of RouteMethod.
   * @param {Object} config Configuration for the route method.
   * @param {string} config.method The HTTP method (GET, POST, etc.).
   * @param {string} config.url The route URL.
   * @param {Function} config.callback The route handler callback function.
   * @param {string} config.currentGroup The current group for the route.
   * @param {string[]} config.hasMatch Optional regex match for the route.
   */
  constructor(config?: {
    method: string;
    url: string;
    callback: Function;
    currentGroup: string;
    hasMatch: string[];
  });

  /**
   * Processes the HTTP method, URL, and callback for the route.
   * @param {Object} config Configuration for the route.
   * @private
   */
  private processMethods(config: {
    method: string;
    url: string;
    callback: Function;
    currentGroup: string;
    hasMatch: string[];
  }): void;

  /**
   * Registers middleware for the route.
   * @param {Function | string | Array<Function | string>} middleware The middleware handler(s) to apply.
   * @returns {RouteMethod} The current instance of RouteMethod for chaining.
   */
  middleware(
    middleware: Function | string | Array<Function | string>
  ): RouteMethod;

  /**
   * Sets the name for the route.
   * @param {string} name The name (alias) for the route.
   * @returns {RouteMethod} The current instance of RouteMethod for chaining.
   */
  name(name: string): RouteMethod;

  /**
   * Sets the regex conditions for the route parameters.
   * @param {Object} regex The regex conditions for the route parameters.
   * @returns {RouteMethod} The current instance of RouteMethod for chaining.
   */
  where(regex: object): RouteMethod;

  /**
   * Retrieves the route data including method, path, callback, middlewares, and other settings.
   * @returns {Object} The route data.
   * @returns {string} method The HTTP method for the route.
   * @returns {string} path The URL path for the route.
   * @returns {Function} callback The callback function for the route.
   * @returns {Function[]} internal_middlewares The array of middlewares for the route.
   * @returns {Object} regex The regex conditions for the route parameters.
   * @returns {string | null} as The alias name for the route (if set).
   * @returns {string[] | null} match The optional regex match groups for the route.
   */
  getRouteData(): {
    internal_middlewares: Function[];
    regex: object;
    as: string | null;
    match: string[] | null;
  };
}

export = RouteMethod;
