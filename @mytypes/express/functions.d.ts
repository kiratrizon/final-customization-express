/// <reference path="./index.d.ts" />

import ExpressView from "../../main/express/http/ExpressView";
import ExpressRedirect from "../../main/express/http/ExpressRedirect";
import ExpressResponse from "../../main/express/http/ExpressResponse";
import Auth from "../../main/express/server/Auth";

declare global {
  /** Placeholder for a function that will dump variable contents for debugging. */
  var dump: (variable: any) => void;

  /** Placeholder for a function that will dump and die, halting execution after dumping. */
  var dd: (variable: any) => void;

  /**
   * Instantiates a new ExpressResponse object.
   * Can be used to fluently build JSON or HTML responses for the application.
   *
   * Usage:
   *   return response('<h1>Hello World</h1>');
   *   return response().json({ success: true });
   *
   * @param html - Optional HTML content to initialize the response with.
   * @returns An instance of ExpressResponse.
   */
  function response(html?: string | null): ExpressResponse;

  // for inner functions

  /** Placeholder for a function that will handle redirection to a given URL. */
  var redirect: (url: string) => ExpressRedirect;

  /**
   * Generate a URL from a named route.
   *
   * Example:
   * ```ts
   * route('user.show', { id: 1 }) // /users/1
   * route('home')                // /
   * ```
   */
  var route: (name: string, params?: Record<string, string | number>) => string;

  /**
   * Redirect or return a JSON response based on the request type.
   * If the request is an AJAX request, it will return a JSON response.
   * Otherwise, it will redirect to the referrer.
   */
  var custom_error: (data: Record<string, any>) => void;

  /**
   * Renders a view template with data and returns the rendered HTML.
   */
  function view(
    view: string,
    data?: Record<string, any>,
    options?: Record<string, any>
  ): ExpressView;

  var auth: () => Auth;
}

export {};
