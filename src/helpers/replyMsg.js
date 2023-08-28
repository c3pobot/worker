'use strict'
const log = require('logger')
const JobCache = require('./jobCache')
const { WebHookMsg } = require('discordapiclient')
module.exports = async(obj = {}, content, method = 'PATCH')=>{
  try{
    let job = await JobCache.getJob(obj)
    if(!job) return
    await WebHookMsg(obj?.token, content, method)
  }catch(e){
    log.error(e)
  }
}
