// Route.d.ts

/**
 * Route Class - Custom Express-like Routing System (Laravel Inspired)
 *
 * Description:
 * This `Route` class provides a Laravel-style API for defining HTTP routes,
 * including support for route grouping, middleware, and named routes. It mimics
 * Laravel's expressive routing syntax within a Node.js/Express environment, using
 * static method chaining to register and organize routes.
 *
 * Features:
 * - Supports all standard HTTP methods: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD.
 * - Enables grouping of routes with shared prefix, middleware, and naming alias.
 * - Middleware support for both individual routes and route groups.
 * - Named routes for convenient referencing.
 * - Controller-based routing with automatic method resolution.
 * - Supports inline closures as route handlers or middleware.
 * - Generates internal route and middleware structure that can be revealed for use in a custom router engine.
 *
 * Internals:
 * - Routes and their metadata are stored internally with auto-incremented IDs.
 * - Middleware can be aliased using a `MiddlewareHandler` class.
 * - Return values from route handlers and middleware are processed using `ExpressResponse`, `ExpressRedirect`, or `ExpressClosure`.
 *
 * Usage Example:
 * ```js
 * Route.group({ prefix: '/api', middleware: 'auth', as: 'api' }, () => {
 *   Route.get('/users', [UserController, 'index']).name('users.index');
 *   Route.post('/users', [UserController, 'store']).name('users.store');
 * });
 * ```
 *
 * Intended for integration into a custom Express-based framework that simulates Laravel's structure.
 */

declare class Route {
  /**
   * Registers a GET route.
   * @param path Route URI.
   * @param handler Controller and method pair. Example: [UserController, 'index']
   * @returns Route (for chaining)
   */
  static get(path: string, handler: [Function, string]): Route;

  /**
   * Registers a POST route.
   * @param path Route URI.
   * @param handler Controller and method pair. Example: [UserController, 'store']
   * @returns Route (for chaining)
   */
  static post(path: string, handler: [Function, string]): Route;
  /**
   * Registers a PUT route.
   * @param path Route URI.
   * @param handler Controller and method pair. Example: [UserController, 'update']
   * @returns Route (for chaining)
   */
  static put(path: string, handler: [Function, string]): Route;
  /**
   * Registers a DELETE route.
   * @param path Route URI.
   * @param handler Controller and method pair. Example: [UserController, 'destroy']
   * @returns Route (for chaining)
   */
  static delete(path: string, handler: [Function, string]): Route;
  /**
   * Registers a PATCH route.
   * @param path Route URI.
   * @param handler Controller and method pair. Example: [UserController, 'updatePartial']
   * @returns Route (for chaining)
   */
  static patch(path: string, handler: [Function, string]): Route;
  /**
   * Registers an OPTIONS route.
   * @param path Route URI.
   * @param handler Controller and method pair. Example: [UserController, 'options']
   * @returns Route (for chaining)
   */
  static options(path: string, handler: [Function, string]): Route;
  /**
   * Registers a HEAD route.
   * @param path Route URI.
   * @param handler Controller and method pair. Example: [UserController, 'head']
   * @returns Route (for chaining)
   */
  static head(path: string, handler: [Function, string]): Route;

  /**
   * Creates a route group with shared properties.
   * @param properties Group options including:
   *  - prefix: URI prefix
   *  - middleware: Middleware to apply
   *  - as: Route name prefix
   * @param callback Function that defines grouped routes
   */
  static group(
    properties: {
      prefix?: string;
      middleware?: string | Function | (string | Function)[];
      as?: string;
    },
    callback: Function
  ): void;

  /**
   * Attaches middleware to the last defined route or current group.
   * @param handler Middleware alias, function, or array of them.
   * @returns Route (for chaining)
   */
  static middleware(
    handler: string | Function | (string | Function)[]
  ): typeof Route;

  /**
   * Assigns a name to the last defined route for reverse URL generation.
   * @param param Route name
   * @returns Route (for chaining)
   */
  static name(param: string): typeof Route;

  /**
   * Renders a view for the last defined route.
   * @param view View name
   * @param data Data to pass to the view
   * @returns Route (for chaining)
   */
  static view(view: string, data?: Record<string, any>): typeof Route;

  /**
   * Exports and returns internal route definitions and router groupings.
   * Automatically resets internal state.
   */
  reveal(): {
    routeValue: Record<number, any>;
    routers: Record<string, any>;
  };

  /**
   * Manually resets internal routing state.
   * This is automatically called by `reveal()`.
   */
  reset(): void;
}

export = Route;
