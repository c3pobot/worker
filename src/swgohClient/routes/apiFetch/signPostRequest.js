'use strict'
const crypto = require('crypto');
const ACCESS_KEY = process.env.ACCESS_KEY
const SECRET_KEY = process.env.SECRET_KEY
module.exports = (uri, headers = {}, body = {}, method)=>{
  // no need to sign if access key and secret key are not present
  if (ACCESS_KEY && SECRET_KEY) {
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    const reqTime = `${new Date().getTime()}`;
    headers['X-Date'] = reqTime;

    hmac.update(reqTime); // request time
    hmac.update(method); // verb e.g POST
    hmac.update(uri); // url e.g /authGuest

    const hash = crypto.createHash('md5');
    hash.update(body ? JSON.stringify(body) : "");
    hmac.update(hash.digest('hex'));

    headers['Authorization'] = `HMAC-SHA256 Credential=${ACCESS_KEY},Signature=${hmac.digest('hex')}`;
  }
}
