'use strict'
const log = require('logger')
const JobCache = require('./jobCache')
const { redis } = require('./redis')
const { WebHookMsg } = require('discordapiclient')
module.exports = async(obj = {}, msg, method = 'PATCH')=>{
  try{
    await redis.setTTL('button-'+obj.id, obj, 600)
    const job = await JobCache.getJob(obj)
    if(job) await WebHookMsg(obj?.token, msg, method)
  }catch(e){
    throw(e)
  }
}
