/* eslint no-nested-ternary: off */

const crypto = require('crypto')
const url = require('url')
const debug = require('debug')('yakbak:hash')

const sort = (obj = {}) => Object.keys(obj)
  .sort()
  .reduce((ret, key) => {
    ret[key] = obj[key]
    return ret
  }, {})

const stringifySort = obj => JSON.stringify(sort(obj))

const reducer = obj => (acc, curr) => {
  if (curr in obj) {
    acc[curr] = obj[curr]
  }
  return acc
}

const pick = (obj, arr) =>
  arr.reduce(reducer(obj), {})

const omit = (obj, arr) =>
  Object.keys(obj)
    .filter(k => !arr.includes(k))
    .reduce(reducer(obj), {})

const parseCookie = (str = '') =>
  str.split(';')
    .map(v => v.split('='))
    .reduce((acc, v) => {
      if (Array.isArray(v)) {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      }
      return acc;
    }, {})

const serializeCookies = (obj) => Object.keys(obj)
  .sort()
  .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
  .join('; ')

/**
 * Generate a custom hash value for tape name.
 * Sorts, picks or omits headers and cookies.
 * @param {Boolean} [noHttpVersion] - exclude httpversion from hash
 * @param {Array<String>} [headers] - pick header names only
 * @param {Array<String>} [noHeaders] - omit header names - use either headers or noHeaders
 * @param {Array<String>} [cookies] - pick cookie names only
 * @param {Array<String>} [noCookies] - omit cookie names - use either cookies or noCookies
 * @param {String} [algorithm=md5]
 * @param {String} [encoding=hex]
 * @return {Function.<String>} `fn(req, body)`
 * @example
 * const customHash = require('yakbak-native-promise/hash')
 * yakbak(host, {
 *   dirname: __dirname,
 *   hash: customHash({
 *     headers: ['authorization'] // only use `authorization` header for hash
 *   })
 * })
 */

const customHash = ({noHttpVersion, headers, noHeaders, cookies, noCookies, algorithm, encoding} = {}) =>
  (req, body = '') => {
    const hash = crypto.createHash(algorithm || 'md5')
    const parts = url.parse(req.url, true);

    const _headers = headers
      ? pick(req.headers, headers)
      : noHeaders
        ? omit(req.headers, noHeaders)
        : req.headers

    if (_headers.cookie) {
      const co = parseCookie(_headers.cookie)
      const rco = cookies
        ? pick(co, cookies)
        : noCookies
          ? omit(co, noCookies)
          : co

      _headers.cookie = serializeCookies(rco)
    }

    debug(_headers)

    if (!noHttpVersion) { hash.update(req.httpVersion) }
    hash.update(req.method)
    hash.update(parts.pathname)
    hash.update(stringifySort(parts.query))
    hash.update(stringifySort(_headers))
    hash.update(stringifySort(req.trailers))
    hash.write(body)

    return hash.digest(encoding || 'hex')
  }

module.exports = customHash
