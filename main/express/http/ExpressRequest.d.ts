// ExpressRequest.d.ts

import ExpressHeader from "./ExpressHeader";

/**
 * ExpressRequest class that encapsulates HTTP request data.
 */
declare class ExpressRequest {
  /**
   * The POST data from the request body
   * @private
   */
  private post: Record<string, any>;

  /**
   * The GET data from the query string
   * @private
   */
  private get: Record<string, any>;

  /**
   * The files sent in the request
   * @private
   */
  private files: Record<string, any>;

  /** The original Express request object */
  request: Record<string, any>;

  /** An instance of the ExpressHeader class for managing request headers */
  headers: ExpressHeader;

  /**
   * A function to access headers by key or all headers if no key is passed
   * @param key The header key
   * @returns The header value or null if the header is not found
   */
  header: (key?: string) => string | null;

  /**
   * A function to access route parameters by key
   * @param key The route parameter key
   * @returns The route parameter value or null if the parameter is not found
   */
  route: (key: string) => string | null;

  /**
   * Constructs an instance of ExpressRequest.
   * @param rq The raw request object (from Express)
   */
  constructor(rq: Record<string, any>);

  /**
   * Access GET query data.
   * @param key The key to access in the query string
   * @returns The query parameter value or null if the key is not found
   */
  query(key?: string): any;

  /**
   * Access POST data (from the request body).
   * @param key The key to access in the POST data
   * @returns The POST parameter value or null if the key is not found
   */
  input(key?: string): any;

  /**
   * Get all data combined from both GET and POST requests.
   * @returns An object containing all GET and POST data
   */
  all(): Record<string, any>;

  /**
   * Get only specific keys from GET and POST data.
   * @param keys An array of keys to retrieve
   * @returns An object containing only the specified keys from the GET and POST data
   */
  only(keys: string[]): Record<string, any>;

  /**
   * Get all data except for specific keys from GET and POST data.
   * @param keys An array of keys to exclude
   * @returns An object containing all data except for the specified keys
   */
  except(keys: string[]): Record<string, any>;

  /**
   * Access file data sent in the request.
   * @param key The key to access in the files data
   * @returns The file data or null if the key is not found
   */
  file(key?: string): any;
}

export = ExpressRequest;
