require('./functions');

/** Placeholder for a function that will navigate back to the previous page. */
globalThis.back = null;

/** Placeholder for a function that will define application routes. */
globalThis.route = null;

globalThis.$_SERVER = {};
globalThis.setcookie = null;

/** Placeholder for a function that will dump variable contents for debugging. */
globalThis.dump = null;

/** Placeholder for a function that will dump variable contents and terminate execution. */
globalThis.dd = null;

/** Placeholder for a function that will send JSON responses. */
globalThis.jsonResponse = null;

define('BASE_URL', '');
define('PATH_URL', '');
define('QUERY_URL', '');
define('ORIGINAL_URL', '');
define('$_POST', {});
define('$_GET', {});
define('$_FILES', {});
define('request', {});
define('$_SESSION', {});
define('$_COOKIE', {});

define('isRequest', null);