// hash.d.ts

/**
 * Hash utility class for password hashing and verification using different strategies.
 *
 * The hashing method is determined dynamically based on the return value of `Boot.hasher()`,
 * supporting 'bcrypt', 'bcryptjs', and 'crypto' (SHA-1).
 */
declare class Hash {
  /**
   * Hashes a password using the selected hashing strategy.
   *
   * Supported hashers:
   * - `'bcrypt'`: Uses Node's `bcrypt` module.
   * - `'bcryptjs'`: Uses the pure JS `bcryptjs` module.
   * - `'crypto'`: Uses SHA-1 directly via Node's built-in crypto module.
   *
   * @param password - The plain text password to hash.
   * @returns The hashed password as a string.
   * @throws Error if an unsupported hasher is configured.
   */
  static make(password: string): string;

  /**
   * Verifies a password against a given hash using the selected hashing strategy.
   *
   * The password is first hashed with SHA-1 and then verified based on the current hasher:
   * - `'bcrypt'` and `'bcryptjs'`: Use compare functions.
   * - `'crypto'`: Directly compares SHA-1 hashes.
   *
   * @param password - The plain text password to verify.
   * @param hash - The stored hash to compare against.
   * @returns A boolean indicating if the password is valid.
   * @throws Error if an unsupported hasher is configured.
   */
  static check(password: string, hash: string): boolean;
}

export = Hash;
