/**
 * Represents middleware handler creation and management.
 */
declare class RouteMiddleware {
  /**
   * Array to hold the middlewares for the route.
   * @private
   */
  #middlewares: Function[];

  /**
   * Creates an instance of RouteMiddleware.
   * @param {Function | string | Array<Function | string>} handler A single middleware function, a middleware alias string, or an array of middleware handlers.
   */
  constructor(handler: Function | string | Array<Function | string>);

  /**
   * Creates and registers middleware for the route.
   * @param {Function | string | Array<Function | string>} handler A single middleware function, a middleware alias string, or an array of middleware handlers.
   * @private
   */
  #middlewareCreate(
    handler: Function | string | Array<Function | string>
  ): void;

  /**
   * Returns the list of middlewares registered for the route.
   * @returns {Function[]} An array of middleware functions.
   */
  getMiddlewares(): Function[];
}

export = RouteMiddleware;
