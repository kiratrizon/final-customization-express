// Auth.d.ts

import Guard from "./Guard";

// Type alias for the Guard instance
type GuardInstance = Guard;

/**
 * Auth class is responsible for handling user authentication logic,
 * including login, logout, checking authentication status, and managing user sessions.
 * It provides various methods for interacting with guards and validating user credentials.
 */
declare class Auth {
  // The default guard to be used for authentication.
  private static defaultGuard: string;

  /**
   * Attempts to authenticate a user based on the provided credentials.
   * @param credentials - The user credentials (e.g., username and password).
   * @param remember - Optional flag indicating if the login should persist.
   * @returns A token or authentication result.
   */
  static attempt(credentials: Record<string, any>, remember?: boolean): any;

  /**
   * Logs in a user by setting the user information in the session.
   * @param user - The user to log in.
   * @param remember - Optional flag indicating if the login should persist.
   * @returns The authentication result.
   */
  static login(user: any, remember?: boolean): any;

  /**
   * Logs in a user using their user ID.
   * @param id - The user ID.
   * @param remember - Optional flag indicating if the login should persist.
   * @returns The authentication result.
   */
  static loginUsingId(id: any, remember?: boolean): any;

  /**
   * Performs a one-time authentication attempt with the provided credentials.
   * This method will not persist the authentication state.
   * @param credentials - The user credentials.
   * @returns The authentication result.
   */
  static once(credentials: Record<string, any>): any;

  /**
   * Performs a one-time login using the provided user ID.
   * This method will not persist the authentication state.
   * @param id - The user ID.
   * @returns The authentication result.
   */
  static onceUsingId(id: any): any;

  /**
   * Logs out the currently authenticated user.
   * @returns The logout result.
   */
  static logout(): any;

  /**
   * Checks if a user is currently authenticated.
   * @returns True if the user is authenticated, otherwise false.
   */
  static check(): boolean;

  /**
   * Checks if the current user is a guest (not authenticated).
   * @returns True if the user is a guest, otherwise false.
   */
  static guest(): boolean;

  /**
   * Retrieves the current authenticated user's ID.
   * @returns The user's ID or null if not authenticated.
   */
  static id(): any;

  /**
   * Retrieves the currently authenticated user.
   * @returns The authenticated user or null if not authenticated.
   */
  static user(): any;

  /**
   * Validates the provided credentials, typically for login.
   * @param credentials - The user credentials to validate.
   * @returns True if the credentials are valid, otherwise false.
   */
  static validate(credentials: Record<string, any>): boolean;

  /**
   * Checks if a user is set or authenticated.
   * @returns True if there is a user, otherwise false.
   */
  static hasUser(): boolean;

  /**
   * Sets the authenticated user manually.
   * @param user - The user to set as authenticated.
   */
  static setUser(user: any): void;

  /**
   * Specifies which guard to use for authentication.
   * @param guardName - The name of the guard to use.
   */
  static shouldUse(guardName: string): void;

  /**
   * Retrieves the guard instance for the specified guard name or default guard.
   * @param name - Optional name of the guard to retrieve. If null or omitted, the default guard is used.
   * @returns The guard instance.
   */
  static guard(name?: string | null): GuardInstance;
}

export = Auth;
