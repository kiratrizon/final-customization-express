/// <reference path="./index.d.ts" />

import ExpressRequest from "../../main/express/http/ExpressRequest";
import { ServerInfo } from "./server";
declare global {
  /**
   * The global `request` instance represents the current HTTP request,
   * encapsulated in the `ExpressRequest` class. It provides convenient
   * methods to access GET, POST, headers, files, and route data.
   *
   * @see ExpressRequest
   */
  var request: (input?: string) => ExpressRequest;
  /** A function that will determine if it's from a request */
  var isRequest: () => boolean;

  /**
   * The base URL of the application.
   */
  var BASE_URL: string;

  /**
   * The URL of the application. Without its base URL and the query string.
   */
  var PATH_URL: string;

  /**
   * The query string of the application.
   */
  var QUERY_URL: string;

  /**
   * The global `$_POST` variable contains data received in the HTTP request body,
   * typically from form submissions using the POST method.
   *
   * It mimics PHP's `$_POST` superglobal and provides key-value pairs.
   */
  var $_POST: Record<string, any>;

  /**
   * The global `$_GET` variable contains data from the URL query string of the HTTP request.
   *
   * It mimics PHP's `$_GET` superglobal and provides key-value pairs for query parameters.
   */
  var $_GET: Record<string, any>;

  /**
   * The global `$_FILES` variable contains information about files uploaded in the HTTP request.
   *
   * It mimics PHP's `$_FILES` superglobal and provides details about each uploaded file.
   */
  var $_FILES: Record<string, any>;

  /**
   * An object containing all HTTP cookies sent by the client.
   *
   * This is the JavaScript equivalent of PHP's `$_COOKIE`. Each key-value pair
   * represents a cookie where the key is the cookie name and the value is its content.
   * Typically accessed via `req.cookies` in Express when using `cookie-parser`.
   */
  var $_COOKIE: Record<string, any>;

  /**
   * An object containing information about the server environment and the current request.
   *
   * This is the JavaScript equivalent of PHP's `$_SERVER`. It provides details such as
   * request headers, server information, and environment variables, which can be accessed
   * through `req` and `res` in Express.
   *
   * Commonly accessed via `req` properties like `req.headers`, `req.protocol`, `req.hostname`,
   * and `req.ip`, as well as through server environment variables like `process.env`.
   */
  var $_SERVER: ServerInfo;
}
export {};
