/* eslint-env mocha */

const assert = require('assert')
const customHash = require('../hash.js')

const createReq = (obj = {}) => {
  const o = Object.assign({
    httpVersion: '1.1',
    url: '/',
    method: 'GET'
  }, obj)

  o.headers = Object.assign({
    host: 'www.example.com',
    authorization: 'Basic QWxhZGRpbjpPcGVuU2VzYW1l',
    'user-agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': 'en,ja;q=0.7,ja;q=0.3',
    'accept-encoding': 'gzip, deflate, br',
    cookie: 'uid=0574e8d; test=1; foo=bar',
    dnt: 1,
    connection: 'keep-alive'
  }, obj.headers)

  return o
}

describe('customHash', function () {

  it('shall create hash', function () {
    const req = createReq()

    req.headers = {}
    const ret = customHash()(req)

    assert.strictEqual(ret, '794fab55fa2badc75cdbbfed40d44d43')
  })

  it('shall select no headers', function () {
    const ret = customHash({headers: []})(createReq())

    assert.strictEqual(ret, '794fab55fa2badc75cdbbfed40d44d43')
  })

  it('shall create hash with only authorization and host headers', function () {
    const ret = customHash({headers: ['host', 'authorization']})(createReq())

    assert.strictEqual(ret, '6eed2d87476a5f97d7586db6d10227d9')
  })

  it('shall create same hash with only authorization and host headers', function () {
    const ret = customHash({headers: ['host', 'authorization']})(
      createReq({headers: {'if-modified-since': 'Wed, 21 Oct 2015 07:28:00 GMT'}})
    )

    assert.strictEqual(ret, '6eed2d87476a5f97d7586db6d10227d9')
  })

  it('shall create hash omitting user-agent, connection, accept', function () {
    const ret = customHash({noHeaders: ['user-agent', 'connection', 'accept']})(createReq())

    assert.strictEqual(ret, '4a70db9ddca64bc2a5d30dde5df6cb08')
  })

  it('shall create a different hash omitting user-agent, connection, accept', function () {
    const ret = customHash({noHeaders: ['user-agent', 'connection', 'accept']})(
      createReq({headers: {'if-modified-since': 'Wed, 21 Oct 2015 07:28:00 GMT'}})
    )

    assert.ok(ret !== '4a70db9ddca64bc2a5d30dde5df6cb08')
    assert.strictEqual(ret, '5439fc6041313b79be178639ac6aaf48')
  })

  it('shall select cookie test only', function () {
    const ret = customHash({headers: ['cookie'], cookies: ['test']})(createReq())

    assert.strictEqual(ret, '0a3d81d1f70ab3edfc2e6c54ef133979')
  })

  it('shall select all cookie except test', function () {
    const ret = customHash({headers: ['cookie'], noCookies: ['test']})(createReq())

    assert.strictEqual(ret, 'b23202a3196993df758a4f3a7963589a')
  })

})
