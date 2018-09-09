// Copyright 2016 Yahoo Inc.
// Licensed under the terms of the MIT license. Please see LICENSE file in the project root for terms.

const {promisify} = require('util')
const buffer = require('./buffer');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const debug = require('debug')('yakbak:record');
const fsWriteFile = promisify(fs.writeFile);
/**
 * Read and pre-compile the tape template.
 * @type {Function}
 * @private
 */

const render = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../src/tape.ejs'), 'utf8'));

/**
 * Record the http interaction between `req` and `res` to disk.
 * The format is a vanilla node module that can be used as
 * an http.Server handler.
 * @param {http.ClientRequest} req
 * @param {http.IncomingMessage} res
 * @param {String} filename
 * @param {Object} opts
 * @returns {Promise.<String>}
 */

module.exports = function (req, res, filename, opts) {
  return buffer(res).then(function (body) {
    return render({ req: req, res: res, body: body });
  }).then(function (data) {
    return write(filename, data);
  }).then(function () {
    return opts && opts.delay && new Promise((resolve) => {
      setTimeout(() => resolve(), opts.delay);
    });
  }).then(function () {
    return filename;
  });
};

/**
 * Write `data` to `filename`. Seems overkill to "promisify" this.
 * @param {String} filename
 * @param {String} data
 * @returns {Promise}
 */

function write(filename, data) {
  debug('write', filename);
  return fsWriteFile(filename, data);
}
