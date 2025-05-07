// Route.d.ts

import RouteGroup from "./RouteHandlers/group";
import RouteMethod from "./RouteHandlers/method";
import Controller from "../../../base/Controller.mjs";

/**
 * Represents a route management system.
 * Handles the registration and processing of HTTP routes, including methods such as GET, POST, PUT, DELETE, etc.
 */
declare class Route {
  /**
   * Adds a view route with a specified path and data.
   * @param path - The path for the view route.
   * @param viewName - The name of the view.
   * @param data - Data to be passed to the view.
   * @returns The created route.
   */
  static view(path: string, viewName: string, data: any): RouteMethod;

  /**
   * Registers a GET route with the specified URL and handler.
   * @param url - The URL pattern for the route.
   * @param handler - The handler function or controller-action pair.
   * @returns The created route.
   */
  static get(url: string, handler: any): RouteMethod;

  /**
   * Registers a POST route with the specified URL and handler.
   * @param url - The URL pattern for the route.
   * @param handler - The handler function or controller-action pair.
   * @returns The created route.
   */
  static post(url: string, handler: any): RouteMethod;

  /**
   * Registers a PUT route with the specified URL and handler.
   * @param url - The URL pattern for the route.
   * @param handler - The handler function or controller-action pair.
   * @returns The created route.
   */
  static put(url: string, handler: any): RouteMethod;

  /**
   * Registers a DELETE route with the specified URL and handler.
   * @param url - The URL pattern for the route.
   * @param handler - The handler function or controller-action pair.
   * @returns The created route.
   */
  static delete(url: string, handler: any): RouteMethod;

  /**
   * Registers a PATCH route with the specified URL and handler.
   * @param url - The URL pattern for the route.
   * @param handler - The handler function or controller-action pair.
   * @returns The created route.
   */
  static patch(url: string, handler: any): RouteMethod;

  /**
   * Registers an OPTIONS route with the specified URL and handler.
   * @param url - The URL pattern for the route.
   * @param handler - The handler function or controller-action pair.
   * @returns The created route.
   */
  static options(url: string, handler: any): RouteMethod;

  /**
   * Registers a HEAD route with the specified URL and handler.
   * @param url - The URL pattern for the route.
   * @param handler - The handler function or controller-action pair.
   * @returns The created route.
   */
  static head(url: string, handler: any): RouteMethod;

  /**
   * Registers an "all" route that listens for all HTTP methods.
   * @param url - The URL pattern for the route.
   * @param handler - The handler function or controller-action pair.
   * @returns The created route.
   */
  static all(url: string, handler: any): RouteMethod;

  /**
   * Registers a route that listens for a specified set of HTTP methods.
   * @param methods - An array of HTTP methods (GET, POST, etc.).
   * @param url - The URL pattern for the route.
   * @param handler - The handler function or controller-action pair.
   * @returns The created route.
   */
  static match(methods: string[], url: string, handler: any): RouteMethod;

  /**
   * Defines a route group with specific configuration.
   * @param config - The configuration object for the route group.
   * @param callback - A callback function to define routes within the group.
   */
  static group(config: { prefix?: string }, callback: () => void): void;

  /**
   * Returns all the registered routes and their configurations.
   * @returns An object containing all the routes, groups, and defaults.
   */
  reveal(): Record<string, any>;
}

export default Route;
