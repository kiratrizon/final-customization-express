declare class ConstructorModel {
  /**
   * Makes a key visible by removing it from the private list.
   * @param {string} key - The key to make visible.
   * @returns {this} The instance for chaining.
   */
  makeVisible(key: string): this;

  /**
   * Makes a key hidden by adding it to the private list.
   * @param {string} key - The key to make hidden.
   * @returns {this} The instance for chaining.
   */
  makeHidden(key: string): this;

  /**
   * Sets the hidden keys by adding them to the private list.
   * @param {string[]} data - The array of keys to set as hidden.
   * @returns {this} The instance for chaining.
   */
  setHidden(data: string[]): this;

  /**
   * Converts the object to a plain JavaScript object excluding hidden keys.
   * @returns {Record<string, any>} The plain object representation of the instance.
   */
  toJson(): Record<string, any>;

  /**
   * Converts the object to an array (same as `toJson`).
   * @returns {Record<string, any>} The array representation of the instance.
   */
  toArray(): Record<string, any>;
}

export default ConstructorModel;
