'use strict'
const JobCache = require('./jobCache')
const BotSocket = require('helpers/botSocket')
module.exports = async(obj = {}, content)=>{
  try{
    //await JobCache.removeJob(obj.jobId)
    return await BotSocket('sendMsg', obj)
    //return await SendMsg(obj.chId, content)
  }catch(e){
    console.error(e);
  }
}
