/**
 * Class that handles rendering views with different engines (e.g., ejs, pug).
 */
declare class ExpressView {
  /**
   * @type {string}
   * The view engine to use for rendering.
   */
  rendered;

  /**
   * Initializes the view engine based on the configuration.
   */
  static init(): Promise<void>;

  /**
   * Renders a view template with data and returns the rendered HTML.
   *
   * @param viewName - The name of the view to render.
   * @param data - The data to pass to the view.
   * @returns The rendered HTML.
   */
  element(viewName: string, data?: Record<string, any>): string;
}

export default ExpressView;
