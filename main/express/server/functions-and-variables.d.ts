// functions.d.ts
import ExpressRedirect from "../http/ExpressRedirect";
import ExpressRequest from "../http/ExpressRequest";
import ExpressResponse from "../http/ExpressResponse";

interface IFetchDataOption {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  timeout?: number;
  responseType?: "json" | "text" | "blob" | "arrayBuffer" | "document";
}
declare global {
  /**
   * This file assigns global variables and functions for the application.
   * It includes utility functions, configuration options, and other helpers
   * that can be used throughout the application.
   *
   * @module AssignGlobal
   */
  var functionDesigner: (key: string, value: any) => void;

  /**
   * Retrieves the value of the specified environment variable.
   * Returns `null` if the variable is not set.
   *
   * Usage:
   *   const value = env('MY_ENV_VAR');
   *
   * @param {string} key - The name of the environment variable to retrieve.
   * @returns {string | null} The value of the environment variable, or `null` if not set.
   */
  var env: (arg1: string, arg2?: any) => any;

  /**
   * Restricts an object to only the specified keys.
   * Returns a new object containing only the provided keys and their associated values.
   *
   * Usage:
   *   const filtered = only(obj, ['key1', 'key2']);
   *
   * @param {Object} source - The object to filter.
   * @param {string[]} keys - The list of keys to include in the new object.
   * @returns {Object} A new object containing only the specified keys.
   */
  var only: (source: Object, keys: string[]) => Object;

  /**
   * Converts the first character of a string to uppercase while keeping the rest unchanged.
   *
   * Usage:
   *   const result = ucFirst('example'); // 'Example'
   *
   * @param {string} str - The string to transform.
   * @returns {string} The string with the first character capitalized.
   */
  var ucFirst: (str: string) => string;

  /**
   * The base path of the application, typically the root directory.
   * This is used as the starting point for resolving all other paths.
   */
  var base_path: (concatenation: string) => string;

  /**
   * The path to the application's resources directory, which typically contains views, translations, and other assets.
   */
  var resources_path: (concatenation: string) => string;

  /**
   * The path to the application's view directory, where view files (such as Blade templates) are stored.
   */
  var view_path: (concatenation: string) => string;

  /**
   * The path to the public directory, which is typically the web server's document root.
   * This is where publicly accessible files like images, JavaScript, and CSS are located.
   */
  var public_path: (concatenation: string) => string;

  /**
   * The path to the public directory, which is typically the web server's document root.
   * This is where publicly accessible files.
   */
  var upload_path: (concatenation: string) => string;

  /**
   * The path to the database directory, where database-related files or configurations might be stored.
   */
  var database_path: (concatenation: string) => string;

  /**
   * The path to the application's core directory, where the main application logic is stored.
   */
  var app_path: (concatenation: string) => string;

  /**
   * The path to the stub directory, where template files or skeleton code files (stubs) are stored.
   */
  var stub_path: () => string;

  /**
   * Retrieves the value of a configuration option, similar to Laravel's `config` helper function.
   * Supports dot notation for nested configuration keys.
   *
   * Usage:
   *   const value = await config('app.name'); // Retrieves the value of `app.name`
   *   const value = await config('database.connections.mysql.host'); // Retrieves the value of a nested key
   *
   * @param {string} key - The configuration key, which can use dot notation for nested values.
   * @returns {any} The value of the configuration option, or `undefined` if the key does not exist.
   * @returns {void} Sets the value of the configuration option if an object is passed as the argument.
   */
  var config: (key: string, value?: any) => Promise<any>;

  /**
   * Writes the serialized content of a variable to a log file.
   * The log file will be created at `rootapplication/tmp/{logName}.log`.
   *
   * Usage:
   *   log({ key: 'value' }, 'debug'); // Writes the object to `tmp/debug.log`
   *
   * @param {any} variable - The variable to write into the log file. Can be any type (string, object, array, etc.).
   * @param {string} logName - The name of the log file (without extension).
   * @returns {void}
   */
  var log: (variable: unknown, logName: string, type: string) => void;

  /**
   * Generates a table name based on the given model name.
   * Typically used to follow naming conventions for database tables.
   *
   * Usage:
   *   const tableName = generateTableNames('User'); // Generates 'users' table name
   *   const tableName = generateTableNames('Post'); // Generates 'posts' table name
   *
   * @param {string} modelName - The model name (e.g., 'User', 'Post') for which to generate the table name.
   * @returns {string} The generated table name, typically plural and in snake_case.
   */
  var generateTableNames: (modelName: string) => string;

  /**
   * Encodes a string to standard Base64.
   */
  var base64_encode: (str: string) => string;

  /**
   * Decodes a standard Base64 string to its original form.
   */
  var base64_decode: (str: string) => string;

  /**
   * Encodes a string to Base64 in a URL-safe format (Base64url).
   * Replaces `+` with `-`, `/` with `_`, and removes any trailing `=` padding.
   */
  var base64_url_encode: (str: string) => string;

  /**
   * Decodes a URL-safe Base64 string (Base64url) to its original form.
   * Replaces `-` with `+`, `_` with `/`, and adds padding if necessary.
   */
  var base64_url_decode: (str: string) => string;

  /**
   * This function mimics PHP's strtotime by parsing a string containing a date or time
   * and returning the corresponding Unix timestamp (in seconds). It supports relative
   * date/time formats such as "next Friday" or "3 days ago" and adjusts based on the
   * system's time zone.
   */
  var strtotime: (time: string, now?: number) => number | null;

  /**
   * This function returns the current date and time
   * in the specified format (e.g., "Y-m-d H:i:s"). If no timestamp is provided,
   * it returns the current system time formatted accordingly.
   */
  var date: (format: string, timestamp?: number) => string;

  /**
   * This function returns the current date and time
   * in the specified format (e.g., "Y-m-d H:i:s"). If no timestamp is provided,
   * it returns the current system time formatted accordingly.
   */
  var DATE: (format: string, timestamp?: number) => string;

  /**
   * Checks whether a given function is defined in the current scope.
   * It returns true if it is a function, otherwise false.
   */
  var is_function: (name: string) => boolean;

  /**
   * Checks whether a given class is defined in the current scope.
   * It returns true if the class exists, otherwise false.
   */
  // var classExists: (name: string) => boolean;

  /**
   * Defines a global variable on `global` with the specified name and value.
   * The variable will be writable but not configurable, meaning:
   * - It can be modified but not deleted.
   * - If the variable already exists, it cannot be redefined.
   *
   * Usage:
   *   define("myVar", 123);
   *   console.log(global.myVar); // 123
   *
   * @param {string} name - The name of the global variable.
   * @param {any} value - The value to assign to the global variable.
   * @throws {Error} If the global variable already exists.
   */
  var define: (name: string, value: any) => void;

  // create description for isDefined function
  /**
   * Checks whether a given variable is defined in the current scope.
   * It returns true if the variable exists, otherwise false.
   */
  var isDefined: (name: string) => boolean;

  /** Placeholder for a function that will dump variable contents for debugging. */
  var dump: (variable: any) => void;

  /** Placeholder for a function that will dump and die, halting execution after dumping. */
  var dd: (variable: any) => void;

  /**
   * Retrieve the last element of an array.
   * If the array is empty, `null` is returned.
   */
  var end: (array: any[]) => any;

  /**
   * tmp_path
   */
  var tmp_path: () => string;

  /**
   * Transfer a file into a new location.
   * @param {string} filePath - The path to the file to be transferred.
   * @param {string} destination - The destination path where the file should be transferred.
   */
  var transferFile: (filePath: string, destination: string) => boolean;

  /**
   * Performs an HTTP request to the specified URL with customizable options.
   * Returns a tuple: [error, response], where either one may be `null`.
   *
   * Usage:
   *   const [error, data] = fetchData('https://api.example.com', { method: 'GET' });
   *
   * @param url - The endpoint to request.
   * @param options - Optional configuration for the request (method, headers, body, etc.).
   * @returns A tuple containing the Promise<[error, data]>.
   */
  var fetchData: (
    url: string,
    options?: IFetchDataOption
  ) => Promise<[any, any]>;

  /**
   * Instantiates a new ExpressResponse object.
   * Can be used to fluently build JSON or HTML responses for the application.
   *
   * Usage:
   *   return response('<h1>Hello World</h1>');
   *   return response().json({ success: true });
   *
   * @param html - Optional HTML content to initialize the response with.
   * @returns An instance of ExpressResponse.
   */
  var response: (html: string | null) => ExpressResponse;

  // for inner functions

  /** Placeholder for a function that will handle redirection to a given URL. */
  var redirect: (url: string) => ExpressRedirect;

  /** A function that will determine if it's from a request */
  var isRequest: (url: string) => boolean;

  var request: (input?: string) => ExpressRequest;

  /**
   * The base URL of the application.
   */
  var BASE_URL: string;

  /**
   * The URL of the application. Without its base URL and the query string.
   */
  var PATH_URL: string;

  /**
   * The query string of the application.
   */
  var QUERY_URL: string;
}

export { };
