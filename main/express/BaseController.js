const express = require('express');

class BaseController {

    init(req, res) {
        this.req = req;
        this.res = res;
    }
}

module.exports = BaseController;
