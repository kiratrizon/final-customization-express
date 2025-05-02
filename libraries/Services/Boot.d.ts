// boot.d.ts

/**
 * Boot utility class for application-level defaults and helpers.
 */
declare class Boot {
  /**
   * Define your global variables here
   */
  static async register(): void;


  /**
   * Handles "Not Found" (404) responses based on the request context.
   *
   * If the current context is a web request, it returns a JSON 404 response.
   * Otherwise, it renders a generic error view.
   *
   * @returns The appropriate 404 response, either JSON or a rendered view.
   */
  static async notFound(): any;

  /**
   * Returns the configured password hasher algorithm.
   *
   * This determines the strategy used by the Hash utility class.
   * Possible values may include: `'bcrypt'`, `'bcryptjs'`, `'crypto'`.
   *
   * @returns A string representing the selected hasher.
   */
  static hasher(): string;
}

export = Boot;
