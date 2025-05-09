import Auth from "../server/Auth";
import ExpressHeader from "./ExpressHeader";
import { IncomingHttpHeaders } from "http";
import ExpressRedirect from "./ExpressRedirect";

export interface RequestData {
  method: string;
  headers: IncomingHttpHeaders;
  body: Record<string, any>;
  query: Record<string, any>;
  cookies: Record<string, any>;
  path: string;
  originalUrl: string;
  ip: string;
  protocol: string;
  files: Record<string, any>;
}
/**
 * ExpressRequest class that encapsulates HTTP request data.
 */
declare class ExpressRequest {
  constructor(rq: RequestData);

  /** The original Express request object */
  request: Record<string, any>;

  /** An instance of the ExpressHeader class for managing request headers */
  headers: InstanceType<typeof ExpressHeader>;

  /**
   * A function to access headers by key or all headers if no key is passed
   * @param key The header key
   * @returns The header value or all headers
   */
  header(key?: string): string | Record<string, string> | null;

  /**
   * A function to access route parameters by key
   * @param key The route parameter key
   * @returns The route parameter value or null
   */
  route(key: string): string | null;

  /** Access GET query data */
  query(key?: string): any;

  /** Access POST data (from the request body) */
  input(key?: string): any;

  /** Get all data combined from both GET and POST requests */
  all(): Record<string, any>;

  /** Get only specific keys from GET and POST data */
  only(keys: string[]): Record<string, any>;

  /** Get all data except for specific keys from GET and POST data */
  except(keys: string[]): Record<string, any>;

  /** Access file data sent in the request */
  file(key?: string): any;

  /** Check if request method matches type (string or array) */
  is(type: string | string[]): boolean;

  /** Validate request data against rules */
  validate(rules: Record<string, any>): Promise<Record<string, any>>;

  /** Get the authenticated user */
  user(): Promise<any>;

  /**
   * Check if the request is an AJAX or XMLHttpRequest or from API
   */
  isRequest(): boolean;
  /** Placeholder for a function that will dump variable contents for debugging. */
  dump: (variable: any) => void;

  /** Placeholder for a function that will dump and die, halting execution after dumping. */
  dd: (variable: any) => void;

  auth: () => InstanceType<typeof Auth>;

  custom_error: (error: Record<string, any>, data?: any) => void;

  /** Placeholder for a function that will handle redirection to a given URL. */
  redirect: (url: string) => InstanceType<typeof ExpressRedirect>;
}

export default ExpressRequest;
