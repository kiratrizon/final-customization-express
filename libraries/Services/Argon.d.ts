// argon.d.ts

/**
 * Argon utility class for secure password hashing and verification.
 *
 * This class first hashes the password using SHA-1 and then applies Argon2d
 * for final storage or verification. Useful for compatibility with legacy systems
 * that used SHA-1 previously.
 */
declare class Argon {
  /**
   * Hashes a password using SHA-1 followed by Argon2d.
   *
   * @param password - The plain text password to hash.
   * @returns A Promise that resolves to the Argon2d-hashed password string.
   */
  static hash(password: string): Promise<string>;

  /**
   * Verifies a password against a stored Argon2d hash.
   *
   * Internally, the password is first hashed with SHA-1 before being
   * checked using Argon2d's verify function.
   *
   * @param password - The plain text password to verify.
   * @param hash - The Argon2d hash to verify against.
   * @returns A Promise that resolves to a boolean indicating if the password is correct.
   */
  static check(password: string, hash: string): Promise<boolean>;
}

export = Argon;
