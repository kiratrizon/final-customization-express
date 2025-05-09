// ExpressHeader.d.ts

import { IncomingHttpHeaders } from "http";
/**
 * ExpressHeader class to manage HTTP headers.
 * It provides an easy interface to retrieve all headers.
 */
declare class ExpressHeader {
  /**
   * Constructs the ExpressHeader instance.
   * @param header - An optional object containing the headers.
   */
  constructor(header?: Record<string, any>);

  /**
   * Retrieves all the headers.
   * @returns An object containing all headers.
   */
  all(): IncomingHttpHeaders;
}

export default ExpressHeader;
