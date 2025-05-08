import "express";
declare module "express-serve-static-core" {
  interface Request {
    /**
     * The files sent in the request
     */
    files?: Record<string, any>;

    /**
     * Stores or retrieves flash data.
     * Flash data is temporary data that is stored in the session and is available for the next request.
     * It is typically used to store messages or notifications that should be displayed to the user.
     * The data is removed from the session after it has been accessed.
     * @param key
     * @param value
     * @returns
     */
    flash?: (key: string, value?: any) => any;
  }

  interface Response {
    responses?: {
      html_dump?: any[];
      json_dump?: any[];
    };
  }
}
export {};
