/// <reference path="./index.d.ts" />

import ExpressView from "../../main/express/http/ExpressView";
import ExpressRedirect from "../../main/express/http/ExpressRedirect";
import ExpressResponse from "../../main/express/http/ExpressResponse";
import Auth from "../../main/express/server/Auth";

declare global {
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

  /**
   * Generate a URL from a named route.
   *
   * Example:
   * ```ts
   * route('user.show', { id: 1 }) // /users/1
   * route('home')                // /
   * ```
   */
  function route(
    name: string,
    params?: Record<string, string | number>
  ): string;

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
