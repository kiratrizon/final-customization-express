// ExpressRegexHandler.d.ts

/**
 * Handles route parameter validation using predefined regex patterns.
 * Useful for validating dynamic route segments like `:id`, `:slug`, etc.
 */
declare class ExpressRegexHandler {
  /**
   * Configuration object specifying which regex rule to apply to each route parameter.
   * Example: `{ id: 'digit', slug: 'slug' }`
   */
  config: Record<string, string>;

  /**
   * Creates an instance of ExpressRegexHandler.
   * @param config - A mapping of parameter names to predefined regex rule keys.
   */
  constructor(config?: Record<string, string>);

  /**
   * Returns an Express middleware function that validates route parameters
   * based on the provided configuration. Responds with 422 if validation fails.
   * @returns An Express-compatible middleware function.
   */
  applyRegex(): (req: any, res: any, next: () => void) => void;
}

export default ExpressRegexHandler;
