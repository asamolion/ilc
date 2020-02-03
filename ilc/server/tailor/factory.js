'use strict';

const urljoin = require('url-join');

const Tailor = require('tailorx');
const fetchTemplate = require('./fetch-template');
const Router = require('../../common/router/ServerRouter');
const registryService = require('../registry/factory');
const filterHeaders = require('./filter-headers');
const errorHandlerSetup = require('./error-handler');

module.exports = function (cdnUrl) {
    const tailor = new Tailor({
        amdLoaderUrl: cdnUrl === null ? '/_ilc/system.js' : urljoin(cdnUrl, '/system.js'),
        fetchTemplate: fetchTemplate(
            __dirname + '/templates',
            new Router(registryService, console)
        ),
        systemScripts: '',
        filterHeaders,
    });

    errorHandlerSetup(tailor);

    return tailor;
};
