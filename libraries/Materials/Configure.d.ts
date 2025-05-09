/**
 * Module: Configure
 * Description: Provides dynamic configuration reading, writing, and resetting
 *              from .mjs files stored in a specified config directory.
 */

declare class Configure {
  /**
   * Reads configuration values from the config directory based on a dot-notation string.
   * Example: "auth.providers.user.driver" reads the corresponding nested property.
   *
   * @param pathString - Dot-separated string indicating the config path.
   * @returns A promise resolving to the requested configuration value or null if not found.
   */
  static read(pathString: string): Promise<any>;

  /**
   * Writes a value to the specified config path in the in-memory store.
   * If the config file hasn't been read yet, it will first attempt to load it.
   *
   * @param pathString - Dot-separated string indicating where to write.
   * @param data - The value to store at the given path.
   * @returns A promise resolving when the operation is complete.
   */
  static write(pathString: string, data: any): Promise<void>;

  /**
   * Clears all stored configuration data from memory.
   * Does not affect actual files on disk.
   */
  static reset(): void;
}

export default Configure;
