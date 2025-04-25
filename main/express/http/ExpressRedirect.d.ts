// ExpressRedirect.d.ts

/**
 * Represents a redirect response helper similar to Laravel's redirect().
 */
declare class ExpressRedirect {
  /**
   * The URL to redirect to.
   */
  url: string | null;

  /**
   * The HTTP status code to use for the redirect.
   */
  statusCode?: number;

  /**
   * Creates a new ExpressRedirect instance.
   * @param url - The URL to redirect to. Defaults to an empty string.
   */
  constructor(url?: string);

  /**
   * Sets the HTTP status code for the redirect.
   * @param code - The status code to set.
   * @returns The current ExpressRedirect instance.
   */
  setStatusCode(code: number): this;
}

export = ExpressRedirect;
