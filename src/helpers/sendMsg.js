'use strict'
const JobCache = require('./jobCache')
const botRequest = require('./botRequest')
module.exports = async(obj = {}, content)=>{
  try{
    //await JobCache.removeJob(obj.jobId)
    return await botRequest('sendMsg', obj)
    //return await SendMsg(obj.chId, content)
  }catch(e){
    throw(e);
  }
}
