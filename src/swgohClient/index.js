const log = require('logger')
const processAPIRequest = require('./processAPIRequest')
const clientRoutes = require('./clientRoutes')
module.exports.post = async(method, opt = {}, identity = null)=>{
  if(!method) return
  if(clientRoutes[method]){
    return await clientRoutes[method](opt, identity)
  }else{
    return await processAPIRequest(method, opt, identity)
  }
}
module.exports.oauth = require('./oauth')
module.exports.Google = require('./oauth/google')
