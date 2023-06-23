'use strict'
const JobCache = require('./jobCache')
const { WebHookMsg } = require('discordapiwrapper')
module.exports = async(obj = {}, content, method = 'PATCH')=>{
  try{
    const job = await JobCache.getJob(obj)
    if(!job) return
    WebHookMsg(obj?.token, content, method)
  }catch(e){
    console.error(e)
  }
}
