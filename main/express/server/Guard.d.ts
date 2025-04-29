// Guard.d.ts

declare class Guard {
  private driver: string;
  private model: any;
  private table: string;
  private driverType: string;

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
}

export = Guard;
