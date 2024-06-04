'use strict'
const processAPIRequest = require('./oauth/processOauthRequest');
module.exports = async(method, opt = {}, identity)=>{
  return await processAPIRequest(method, opt, identity)
}
