const ExpressError = require('./ExpressError');

/**
 * Retrieves the value of the specified environment variable.
 * Returns `undefined` if the variable is not set.
 *
 * Usage:
 *   const value = env('MY_ENV_VAR');
 *
 * @param {string} key - The name of the environment variable to retrieve.
 * @returns {string | null} The value of the environment variable, or `undefined` if not set.
*/
globalThis.env = null;

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
globalThis.only = null;

/**
 * Converts the first character of a string to uppercase while keeping the rest unchanged.
 *
 * Usage:
 *   const result = ucFirst('example'); // 'Example'
 *
 * @param {string} str - The string to transform.
 * @returns {string} The string with the first character capitalized.
*/
globalThis.ucFirst = null;

/**
 * Calculates a future date by adding a specified number of days to the current date.
 *
 * Usage:
 *   const futureDate = getFutureDate(5); // Returns the date 5 days from now
 *
 * @param {number} days - The number of days to add to the current date.
 * @returns {string} The future date in the format `Y-m-d H:i:s`.
*/
globalThis.getFutureDate = null;

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
globalThis.log = null;

/**
 * Retrieves the value of a configuration option, similar to Laravel's `config` helper function.
 * Supports dot notation for nested configuration keys.
 *
 * Usage:
 *   const value = config('app.name'); // Retrieves the value of `app.name`
 *   const value = config('database.connections.mysql.host'); // Retrieves the value of a nested key
 *
 * @param {string} key - The configuration key, which can use dot notation for nested values.
 * @returns {any} The value of the configuration option, or `undefined` if the key does not exist.
*/
globalThis.config = null;

/**
 * The base path of the application, typically the root directory.
 * This is used as the starting point for resolving all other paths.
*/
globalThis.base_path = null;

/**
 * The path to the application's resources directory, which typically contains views, translations, and other assets.
*/
globalThis.resources_path = null;

/**
 * The path to the application's view directory, where view files (such as Blade templates) are stored.
*/
globalThis.view_path = null;

/**
 * The path to the public directory, which is typically the web server's document root.
 * This is where publicly accessible files like images, JavaScript, and CSS are located.
*/
globalThis.public_path = null;

/**
 * The path to the database directory, where database-related files or configurations might be stored.
*/
globalThis.database_path = null;

/**
 * The path to the application's core directory, where the main application logic is stored.
*/
globalThis.app_path = null;

/**
 * The path to the stub directory, where template files or skeleton code files (stubs) are stored.
*/
globalThis.stub_path = null;

globalThis.tmp_path = null;

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
globalThis.generateTableNames = null;

/**
 * Encodes a string to standard Base64.
*/
globalThis.base64_encode = null;

/**
 * Decodes a standard Base64 string to its original form.
*/
globalThis.base64_decode = null;

/**
 * Encodes a string to Base64 in a URL-safe format (Base64url).
 * Replaces `+` with `-`, `/` with `_`, and removes any trailing `=` padding.
*/
globalThis.base64_encode_safe = null;

/**
 * Decodes a URL-safe Base64 string (Base64url) to its original form.
 * Replaces `-` with `+`, `_` with `/`, and adds padding if necessary.
*/
globalThis.base64_decode_safe = null;

/**
 * This function mimics PHP's strtotime by parsing a string containing a date or time
 * and returning the corresponding Unix timestamp (in seconds). It supports relative
 * date/time formats such as "next Friday" or "3 days ago" and adjusts based on the 
 * system's time zone.
*/
globalThis.strtotime = null;

/**
 * Represents the current date and time, returning it in the format "Y-m-d H:i:s" 
 * (Year-Month-Day Hour:Minute:Second). This is typically used to get the current 
 * timestamp formatted in a human-readable way, adjusted to the system's time zone.
*/
globalThis.NOW = globalThis.currentTime = null;

/**
 * This function returns the current date and time 
 * in the specified format (e.g., "Y-m-d H:i:s"). If no timestamp is provided, 
 * it returns the current system time formatted accordingly.
*/
globalThis.date = globalThis.DATE = null;

/**
 * Checks whether a given function is defined in the current scope. 
 * It returns true if the function exists, otherwise false.
*/
globalThis.function_exists = null;

/**
 * Represents the POST data sent to the server in an HTTP request. This object 
 * can be used to access form data or other data submitted via HTTP POST method.
*/
globalThis.$_POST = {};

/**
 * Represents the GET data sent to the server in an HTTP request. This object 
 * can be used to access query string parameters or other data submitted via 
 * the HTTP GET method.
*/
globalThis.$_GET = {};

/**
 * Represents the FILES data sent to the server in an HTTP request. This object 
 * can be used to access uploaded files via the HTTP POST method.
*/
globalThis.$_FILES = {};

globalThis.$_REQUEST = {};
globalThis.$_SERVER = {};
globalThis.$_COOKIE = {};
globalThis.setcookie = null;
globalThis.$_SESSION = {};

/** Placeholder for a function that will dump variable contents for debugging. */
globalThis.dump = null;

/** Placeholder for a function that will dump variable contents and terminate execution. */
globalThis.dd = null;

/** Placeholder for a function that will send JSON responses. */
globalThis.jsonResponse = null;

/** Placeholder for a function that will render views or templates. */
globalThis.view = null;

/** Placeholder for a function that will handle redirection to a given URL. */
globalThis.redirect = null;

/** Placeholder for a function that will navigate back to the previous page. */
globalThis.back = null;

/** Placeholder for a function that will check if a given URL is an API endpoint. */
globalThis.isApiUrl = null;

/** Placeholder for a function that will define application routes. */
globalThis.route = null;

globalThis.BASE_URL = null;
globalThis.PATH_URL = null;
globalThis.PATH_QUERY = null;
globalThis.ORIGINAL_URL = null;
globalThis.DEFAULT_BACK = null;

globalThis.ExpressError = ExpressError;

globalThis.response = function(html = null){
    const ExpressResponse = require('./ExpressResponse');
    const EResponse = new ExpressResponse(html);
    return EResponse;
}