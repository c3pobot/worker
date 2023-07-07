'use strict'
const JobCache = require('./jobCache')
const { WebHookMsg } = require('discordapiclient')
module.exports = async(obj = {}, content)=>{
  try{
    await JobCache.removeJob(obj.jobId)
    let msg2send = content || {content: 'Critical Error occured'}
    WebHookMsg(obj.token, msg2send, 'PATCH')
  }catch(e){
    console.error(e)
  }
}
