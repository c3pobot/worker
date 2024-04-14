'use strict'
const log = require('logger');
const jobCache = require('helpers/jobCache');
const { cmdMap } = require('helpers/cmdMap')
const { replyMsg } = require('src/helpers')
module.exports = async(obj = {})=>{
  try{
    if(!obj?.data || !obj?.data?.name) return
    if(!obj.jobId) obj.jobId = obj.token
    if(!obj.timestamp) obj.timestamp = obj.timestamp
    await jobCache.addJob(obj)
    if(!cmdMap || !cmdMap[obj.data.name]) return
    let msg2send = await cmdMap[obj.data.name](obj)
    if(msg2send) await replyMsg(obj, msg2send)
  }catch(e){
    log.error(e)
  }
}
