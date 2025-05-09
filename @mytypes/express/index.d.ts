import "express";
import ExpressRequest from "../../main/express/http/ExpressRequest";
import type { ServerInfo } from "./server";

interface IPhpGlobals {
  /**
   * The global `$_GET` variable contains data from the URL query string of the HTTP request.
   *
   * It mimics PHP's `$_GET` superglobal and provides key-value pairs for query parameters.
   */
  $_GET: Record<string, any>;
  /**
   * The global `$_POST` variable contains data received in the HTTP request body,
   * typically from form submissions using the POST method.
   *
   * It mimics PHP's `$_POST` superglobal and provides key-value pairs.
   */
  $_POST: Record<string, any>;
  /**
   * An object containing all HTTP cookies sent by the client.
   *
   * This is the JavaScript equivalent of PHP's `$_COOKIE`. Each key-value pair
   * represents a cookie where the key is the cookie name and the value is its content.
   * Typically accessed via `req.cookies` in Express when using `cookie-parser`.
   */
  $_COOKIE: Record<string, any>;
  /**
   * The global `$_FILES` variable contains information about files uploaded in the HTTP request.
   *
   * It mimics PHP's `$_FILES` superglobal and provides details about each uploaded file.
   */
  $_FILES: Record<string, any>;
  /**
   * Interface that defines the structure of server-related information in an HTTP request.
   * This includes details about the server, client, request method, headers, and more.
   */
  $_SERVER: ServerInfo;
}
declare module "express-serve-static-core" {
  interface Request {
    /**
     * The files sent in the request
     */
    files?: Record<string, any>;

    /**
     * Stores or retrieves flash data.
     * Flash data is temporary data that is stored in the session and is available for the next request.
     * It is typically used to store messages or notifications that should be displayed to the user.
     * The data is removed from the session after it has been accessed.
     * @param key
     * @param value
     * @returns
     */
    flash?: (key: string, value?: any) => any;

    request: InstanceType<typeof ExpressRequest>;
    globals: Record<string, any>;
    phpGlobals: IPhpGlobals;
  }

  interface Response {
    responses?: {
      html_dump?: any[];
      json_dump?: any[];
    };
  }
}
export {};
