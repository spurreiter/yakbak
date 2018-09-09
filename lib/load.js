// Copyright 2018 spurreiter
// Licensed under the terms of the MIT license. Please see LICENSE file in the project root for terms.

const {promisify} = require('util')
const fs = require('fs')

const fsReadFile = promisify(fs.readFile)

/**
 * parse and evaluate recorded tape.
 * uses `new Function()` which in this context is as "evil" as `require()`.
 * @private
 * @param {String} filename
 * @param {String} data
 * @return {Function} tape(req, res)
 */

function requireTape(filename, data) {
  const src = `
    const module = {}
    const __filename = __context.filename
    const require = __context.require
    ${data}
    return module.exports
  `
  const __context = {
    filename,
    require
  }

  return Function('__context', src).call(null, __context) // eslint-disable-line no-new-func
}

/**
 * load and evaluate recorded tape
 * @param {String} filename
 * @param {String} data
 * @return {Promise.<Function>} - tape(req, res)
 */

module.exports = function load(filename, data) {
  return data
    ? Promise.resolve(requireTape(filename, data))
    : fsReadFile(filename, 'utf8').then(_data => requireTape(filename, _data))
}
