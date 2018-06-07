var utils = require('./utils');

var validateRequest = function(appsecret, headers, body) {
  var md5      = utils.genMD5(JSON.stringify(body));
  var checksum = utils.genChecksum(appsecret + md5 + headers.curtime);
  return headers.md5 === md5 && headers.checksum === checksum;
}
/**
connect middleware

Examples:
var webhookMiddleware = sdk.webhook();
var webhookMiddleware = sdk.webhook({
    validate:false // don't attempt request validation
});
 */
var webhook = function() {
  var opts = { validate: true };

  // process arguments
  if (arguments.length === 1) {
    if (typeof arguments[0] === "object") {
      opts = arguments[0];
    } else if (typeof arguments[0] === "boolean") {
      opts.validate = arguments[0];
    } else {
      throw new Error('Parameter has to be Object or Boolean');
    }
  } else if (arguments.length > 1) {
    throw new Error('One parameter at most, Object or Boolean only');
  }

  var appsecret = this._o.appsecret;
  return function hook(req, res, next) {
    var valid = validateRequest(appsecret, req.headers, req.body);
    if (opts.validate && !valid) {
      res.writeHead(403);
      res.end(JSON.stringify({code: 403, message: 'Netease IM Request Validation Failed'}));
    } else {
      next();
    }
  }
}

module.exports = webhook;