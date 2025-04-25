/**
 * Logger Utility Class
 *
 * Provides logging functionality that appends logs to a `.log` file in the `tmp/logs` directory.
 * Also prints the log in the console unless the app is running in production.
 */
declare class Logger {
  /**
   * Logs a message or object to a specific destination file with optional additional text.
   *
   * @param value - The value to log. Can be a string, number, object, etc.
   * @param destination - The filename (without extension) where the log will be stored, e.g., `error`, `debug`.
   * @param text - (Optional) Additional text to prefix the log message.
   *
   * The method formats the message with a timestamp (from `Carbon.getDateTime()`),
   * writes it to a `.log` file inside `tmp/logs`, and outputs it to the console (except in production).
   */
  static log(value: any, destination: string, text?: string): void;
}

export = Logger;
