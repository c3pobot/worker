'use strict'
const JobCache = require('./jobCache')
module.exports = async(obj = {})=>{
  try{
    await JobCache.removeJob(obj.jobId)
    MSG.WebHookMsg(obj.token, {content: 'Critical Error occured'}, 'PATCH')
  }catch(e){
    console.error(e)
  }
}
