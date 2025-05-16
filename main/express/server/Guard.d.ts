// Guard.d.ts

declare class Guard {
  constructor(driver: string, modelOrTable: any, driverProvider: string);

  /**
   * Attempt to authenticate a user with provided data.
   *
   * @param data The credentials for authentication
   * @returns string | boolean A JWT token or false if authentication fails
   */
  attempt(data: { [key: string]: string }): Promise<string | null>;

  /**
   * Check if the user is authenticated by verifying the JWT token.
   *
   * @returns object | false The decoded token if valid, false otherwise
   */
  check(): object | false;
  /**
   * Get the ID of the authenticated user.
   *
   * @returns string | null The user ID if authenticated, null otherwise
   */
  id(): string | null;
  /**
   * Get the authenticated user.
   *
   * @returns object | null The user object if authenticated, null otherwise
   */
  user(): Promise<object | null>;
}
export default Guard;
