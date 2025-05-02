// ExpressResponse.d.ts

/**
 * ExpressResponse provides a structured way to build and manage HTTP responses,
 * mimicking Laravel's fluent response syntax. Supports HTML and JSON responses,
 * with header control and status code customization.
 */
declare class ExpressResponse {
  /**
   * Creates an instance of ExpressResponse.
   *
   * @param html - Optional initial HTML content to set.
   */
  constructor(html?: string | null);

  /**
   * Sets a JSON response body with an optional status code.
   * Throws an error if HTML response is already set.
   *
   * @param data - The data to be returned as JSON.
   * @param statusCode - Optional HTTP status code (default: 200).
   * @returns The current instance for method chaining.
   */
  json(data: any, statusCode?: number): this;

  /**
   * Sets a response header.
   * Throws an error if HTML response is already set.
   *
   * @param key - Header name.
   * @param value - Header value.
   * @returns The current instance for method chaining.
   */
  header(key: string, value: string): this;

  /**
   * Sets an HTML response body with an optional status code.
   * Throws an error if a JSON response is already set.
   *
   * @param content - The HTML content to return.
   * @param statusCode - Optional HTTP status code (default: 200).
   * @returns The current instance for method chaining.
   */
  html(content: string, statusCode?: number): this;

  /**
   * Merges additional headers into the response.
   * Throws an error if headers are invalid.
   *
   * @param headers - A key-value map of headers.
   * @returns The current instance for method chaining.
   */
  withHeaders(headers: Record<string, string>): this;

  /**
   * Returns the final response data in a structured format,
   * including the content type, status code, and headers.
   * Throws an error if no response content was set.
   *
   * @returns An object containing the response details.
   */
  accessData(): {
    html: string | null;
    json: any;
    headers: Record<string, string>;
    statusCode: number;
    returnType: "html" | "json";
  };
}

export = ExpressResponse;
