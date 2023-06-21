'use strict'
const JobCache = require('./jobCache')
module.exports = async(obj = {}, content, method = 'PATCH')=>{
  try{
    const job = await JobCache.getJob(obj)
    if(job) MSG.WebHookMsg(obj?.token, content, method)
  }catch(e){
    console.error(e)
  }
}
