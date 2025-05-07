// Authenticatable.d.ts

import Model from "./Model.mjs";

/**
 * Represents a model that can be authenticated.
 * Provides methods required for user authentication, such as retrieving the password,
 * the remember token, and the unique identifier used to store sessions.
 */
declare class Authenticatable extends Model {
  /**
   * The password used for authentication.
   */
  password: string;

  /**
   * The remember token used for persistent login sessions.
   */
  remember_token: string;

  /**
   * Returns the name of the unique identifier field used for authentication.
   * Commonly 'id'.
   * @returns The name of the identifier field.
   */
  getAuthIdentifierName(): string;

  /**
   * Returns the unique identifier value used for authentication.
   * @returns The value of the identifier field (e.g., the user's ID).
   */
  getAuthIdentifier(): any;

  /**
   * Returns the password used for authentication.
   * @returns The user's password.
   */
  getAuthPassword(): string;

  /**
   * Retrieves the remember token value.
   * Used for "remember me" functionality.
   * @returns The remember token.
   */
  getRememberToken(): string;

  /**
   * Sets the remember token value.
   * @param token - The new remember token.
   */
  setRememberToken(token: string): void;

  /**
   * Returns the name of the remember token field.
   * Commonly 'remember_token'.
   * @returns The field name for the remember token.
   */
  getRememberTokenName(): string;
}

export default Authenticatable;
