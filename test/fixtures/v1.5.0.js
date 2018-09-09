var path = require("path");

/**
 * GET /test/ * /test
 *
 * host: {addr}:{port}
 * user-agent: My User Agent/1.0
 * x-escape-comments: * // *
 * connection: close
 */

module.exports = function (req, res) {
  res.statusCode = 201;

  res.setHeader("content-type", "text/html");
  res.setHeader("date", "Sat, 26 Oct 1985 08:20:00 GMT");
  res.setHeader("connection", "close");
  res.setHeader("content-length", "2");

  res.setHeader("x-yakbak-tape", path.basename(__filename, ".js"));

  res.write(Buffer.from("T0s=", "base64"));
  res.end();

  return __filename;
};
