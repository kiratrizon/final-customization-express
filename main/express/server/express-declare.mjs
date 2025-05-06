import './public.mjs';

import ExpressResponse from '../http/ExpressResponse.mjs';
functionDesigner('response', function (html = null) {
    const EResponse = new ExpressResponse(html);
    return EResponse;
});

const dfunc = () => {

}

define('route', dfunc)
define('redirect', dfunc)

define('setcookie', dfunc)

define('request', dfunc);

define('dump', dfunc);

define('dd', dfunc);
define('custom_error', dfunc)

define('$_SERVER', {})
define('$_POST', {});
define('$_GET', {});
define('$_FILES', {});
define('$_SESSION', {});
define('$_COOKIE', {});

define('isRequest', null);