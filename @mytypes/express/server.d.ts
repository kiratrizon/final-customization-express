/**
 * Interface that defines the structure of server-related information in an HTTP request.
 * This includes details about the server, client, request method, headers, and more.
 */
export interface ServerInfo {
  /**
   * The name of the server (e.g., 'localhost' or the domain name).
   */
  SERVER_NAME: string;

  /**
   * The IP address of the server.
   */
  SERVER_ADDR: string;

  /**
   * The port number on which the server is listening for requests.
   */
  SERVER_PORT: string;

  /**
   * The protocol used in the request (e.g., 'http' or 'https').
   */
  SERVER_PROTOCOL: string;

  /**
   * The HTTP method of the request (e.g., 'GET', 'POST').
   */
  REQUEST_METHOD: string;

  /**
   * The query string part of the URL (if present).
   */
  QUERY_STRING: string;

  /**
   * The full request URI, including path and query string.
   */
  REQUEST_URI: string;

  /**
   * The document root of the server.
   */
  DOCUMENT_ROOT: string;

  /**
   * The User-Agent string sent by the client, describing the browser or client making the request.
   */
  HTTP_USER_AGENT: string;

  /**
   * The referer URL, if any, from which the request was made.
   */
  HTTP_REFERER: string;

  /**
   * The IP address of the client making the request.
   */
  REMOTE_ADDR: string;

  /**
   * The port number of the client making the request.
   */
  REMOTE_PORT: string;

  /**
   * The path part of the request URL (e.g., '/path/to/resource').
   */
  SCRIPT_NAME: string;

  /**
   * The HTTPS status, indicating whether the connection is secure ('on') or not ('off').
   */
  HTTPS: string;

  /**
   * The protocol forwarded by any reverse proxies, such as 'https' or 'http'.
   */
  HTTP_X_FORWARDED_PROTO: string;

  /**
   * The original IP address of the client as forwarded by any reverse proxy.
   */
  HTTP_X_FORWARDED_FOR: string;

  /**
   * The timestamp of the request in ISO format (e.g., '2025-05-06 12:30:45').
   */
  REQUEST_TIME: string;

  /**
   * The timestamp in milliseconds since the Unix Epoch.
   */
  REQUEST_TIME_FLOAT: number;

  /**
   * The CGI version, typically 'CGI/1.1'.
   */
  GATEWAY_INTERFACE: string;

  /**
   * The server signature, such as 'X-Powered-By: Throy Tower'.
   */
  SERVER_SIGNATURE: string;

  /**
   * The path info of the request.
   */
  PATH_INFO: string;

  /**
   * The 'Accept' header sent by the client, which defines the types of media the client can process.
   */
  HTTP_ACCEPT: string;

  /**
   * A unique request ID generated for tracking purposes. This may be provided in the request headers.
   */
  "X-Request-ID": string;
}
