'use strict'
const clientRoutes = require('./routes')
const oauth = require('./oauth')
module.exports = async(uri, payload = {}, identity = null, job = {})=>{
  try{
    if(identity) return await oauth(uri, payload, identity, job)
    if(clientRoutes[uri]) return await clientRoutes[uri](payload)
    return await clientRoutes.apiFetch(uri, payload)
  }catch(e){
    throw(e)
  }
}
