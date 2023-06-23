'use strict'
const JobCache = require('./jobCache')
const { WebHookMsg } = require('discordapiwrapper')
module.exports = async(obj = {}, msg, method = 'PATCH')=>{
  try{
    await redis.setTTL('button-'+obj.id, obj, 600)
    const job = await JobCache.getJob(obj)
    if(job) WebHookMsg(obj?.token, msg, method)
  }catch(e){
    console.error(e)
  }
}
