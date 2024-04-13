'use strict'
const SwgohClient = require('client-stub');
module.exports.post = async(method, opt = {}, identity = null)=>{
  try{
    return await SwgohClient.post(method, opt, identity)
  }catch(e){
    throw(e);
  }
}
module.exports.oauth = async(obj, method, dObj, payload, loginConfirmed = null)=>{
  try{
    return await SwgohClient.oauth(obj, method, dObj, payload, loginConfirmed)
  }catch(e){
    throw(e);
  }
}
module.exports.Google = SwgohClient.Google
module.exports.setGameData = SwgohClient.setGameData
