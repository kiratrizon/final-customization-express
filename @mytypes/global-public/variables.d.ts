/// <reference path="./index.d.ts" />

declare global {
  /**
   * A flag indicating whether the application is running in a production environment.
   * This value is typically set based on the environment configuration (e.g., via environment variables).
   * It is used to distinguish between production and non-production environments for configuration purposes.
   */
  var IN_PRODUCTION: boolean;

  /**
   * The database type used in the application.
   * This value is fetched from the application's configuration or defaults to 'sqlite' if not set.
   */
  var dbUsed: string;
}
export {};
