'use strict'
const JobCache = require('./jobCache')
module.exports = async(obj = {}, content)=>{
  try{
    await JobCache.removeJob(obj.jobId)
    let msg2send = content || {content: 'Critical Error occured'}
    MSG.WebHookMsg(obj.token, msg2send, 'PATCH')
  }catch(e){
    console.error(e)
  }
}
