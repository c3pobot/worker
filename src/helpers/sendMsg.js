'use strict'
const JobCache = require('./jobCache')
module.exports = async(obj = {}, content)=>{
  try{
    //await JobCache.removeJob(obj.jobId)
    return await BotSocket.call('sendMsg', obj, content)
    //return await SendMsg(obj.chId, content)
  }catch(e){
    console.error(e);
  }
}
