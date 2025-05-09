import './public.mjs';

import ExpressResponse from '../http/ExpressResponse.mjs';
import ExpressView from '../http/ExpressView.mjs';
functionDesigner('response', function (html = null) {
    const EResponse = new ExpressResponse(html);
    return EResponse;
});

functionDesigner('view', (viewName, data = {}, mergeData = {}) => {
    const newData = { ...data, ...mergeData };
    // Add old() helper to data
    newData['old'] = function (key) {
        // Here you can return old input from session or fallback
        return 'test'; // Stubbed for now
    };

    const newView = new ExpressView(newData);
    newView.element(viewName);
    return newView;
});

const dfunc = () => {

}

define('setcookie', dfunc)