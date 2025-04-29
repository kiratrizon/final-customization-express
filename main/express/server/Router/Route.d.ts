import RouteMethod from "./RouteHandlers/method";
import RouteGroup from "./RouteHandlers/group";

declare class Route {
  private static routeId: number;
  private static groupId: number;
  private static storedControllers: { [key: string]: any };
  private static currentGroup: string[];
  private static groupPreference: { [key: string]: RouteGroup };
  private static methodPreference: { [key: string]: RouteMethod };
  private static defaultRoute: {
    get: number[];
    post: number[];
    put: number[];
    delete: number[];
    patch: number[];
    options: number[];
    head: number[];
    all: number[];
  };

  /**
   * Registers a route with a view handler.
   * @param {string} path The URL path for the route.
   * @param {string} viewName The view name to render.
   * @param {Object} data The data to pass to the view.
   * @returns {RouteMethod} The route method instance.
   */
  static view(path: string, viewName: string, data: object): RouteMethod;

  /**
   * Processes the route handler for a given method.
   * @param {Function | string[]} handler The handler (controller or callback function).
   * @param {string} method The HTTP method (GET, POST, etc.).
   * @private
   * @returns {Function} The processed route handler.
   */
  private static handlerProcessor(
    handler: Function | string[],
    method: string
  ): Function;

  /**
   * Processes and registers the route with method, URL, and handler.
   * @param {string} url The URL path for the route.
   * @param {Function | string[]} handler The handler for the route.
   * @param {string} method The HTTP method (GET, POST, etc.).
   * @param {string[]} hasMatch Optional regex match groups for the route.
   * @private
   * @returns {RouteMethod} The route method instance.
   */
  private static processRoute(
    url: string,
    handler: Function | string[],
    method: string,
    hasMatch?: string[]
  ): RouteMethod;

  /**
   * Combines and returns the current route group prefix.
   * @private
   * @returns {string} The combined route group prefix.
   */
  private static groupCombiner(): string;

  /**
   * Registers a route group.
   * @param {Object} config Configuration for the group (e.g., prefix).
   * @param {Function} callback The callback to execute within the group context.
   */
  static group(config: { prefix?: string }, callback: Function): void;

  /**
   * Registers a GET route.
   * @param {string} url The URL path for the route.
   * @param {Function | string[]} handler The handler for the route.
   * @returns {RouteMethod} The route method instance.
   */
  static get(url: string, handler: Function | string[]): RouteMethod;

  /**
   * Registers a POST route.
   * @param {string} url The URL path for the route.
   * @param {Function | string[]} handler The handler for the route.
   * @returns {RouteMethod} The route method instance.
   */
  static post(url: string, handler: Function | string[]): RouteMethod;

  /**
   * Registers a PUT route.
   * @param {string} url The URL path for the route.
   * @param {Function | string[]} handler The handler for the route.
   * @returns {RouteMethod} The route method instance.
   */
  static put(url: string, handler: Function | string[]): RouteMethod;

  /**
   * Registers a DELETE route.
   * @param {string} url The URL path for the route.
   * @param {Function | string[]} handler The handler for the route.
   * @returns {RouteMethod} The route method instance.
   */
  static delete(url: string, handler: Function | string[]): RouteMethod;

  /**
   * Registers a PATCH route.
   * @param {string} url The URL path for the route.
   * @param {Function | string[]} handler The handler for the route.
   * @returns {RouteMethod} The route method instance.
   */
  static patch(url: string, handler: Function | string[]): RouteMethod;

  /**
   * Registers an OPTIONS route.
   * @param {string} url The URL path for the route.
   * @param {Function | string[]} handler The handler for the route.
   * @returns {RouteMethod} The route method instance.
   */
  static options(url: string, handler: Function | string[]): RouteMethod;

  /**
   * Registers a HEAD route.
   * @param {string} url The URL path for the route.
   * @param {Function | string[]} handler The handler for the route.
   * @returns {RouteMethod} The route method instance.
   */
  static head(url: string, handler: Function | string[]): RouteMethod;

  /**
   * Registers a route for multiple methods.
   * @param {string[]} methods The HTTP methods to register (e.g., ['get', 'post']).
   * @param {string} url The URL path for the route.
   * @param {Function | string[]} handler The handler for the route.
   * @returns {RouteMethod} The route method instance.
   */
  static match(
    methods: string[],
    url: string,
    handler: Function | string[]
  ): RouteMethod;

  /**
   * Registers a route for all HTTP methods.
   * @param {string} url The URL path for the route.
   * @param {Function | string[]} handler The handler for the route.
   * @returns {RouteMethod} The route method instance.
   */
  static all(url: string, handler: Function | string[]): RouteMethod;

  /**
   * Reveals the route data, including default routes, groups, and method preferences.
   * @returns {Object} The route data.
   */
  reveal(): {
    default_route: { [key: string]: number[] };
    group: { [key: string]: RouteGroup };
    routes: { [key: string]: RouteMethod };
  };

  /**
   * Resets the route configuration.
   * @private
   */
  private reset(): void;
}

export = Route;
