'use strict'
const JobCache = require('./jobCache')
const redis = require('redisclient')
const { WebHookMsg } = require('discordapiclient')
module.exports = async(obj = {}, msg, method = 'PATCH')=>{
  try{
    await redis.setTTL('button-'+obj.id, obj, 600)
    let job = await JobCache.getJob(obj)
    if(job) await WebHookMsg(obj?.token, msg, method)
  }catch(e){
    throw(e)
  }
}
