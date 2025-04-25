// ExpressHeader.d.ts

/**
 * ExpressHeader class to manage HTTP headers.
 * It provides an easy interface to retrieve all headers.
 */
declare class ExpressHeader {
  /**
   * Stores the headers in an object.
   */
  private header: Record<string, any>;

  /**
   * Constructs the ExpressHeader instance.
   * @param header - An optional object containing the headers.
   */
  constructor(header?: Record<string, any>);

  /**
   * Retrieves all the headers.
   * @returns An object containing all headers.
   */
  all(): Record<string, any>;
}

export = ExpressHeader;
