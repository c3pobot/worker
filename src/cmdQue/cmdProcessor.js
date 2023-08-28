'use strict'
const log = require('logger')
const redis = require('redisclient')

const LOCAL_QUE_KEY = process.env.LOCAL_QUE_KEY

const { AddJob, DeepCopy, ReplyError, RemoveJob, ReplyMsg } = require('helpers')
const { CmdMap } = require('helpers/cmdMap')
const Cmds = {}

const addtoLocalQue = async(job = {})=>{
  try{
    let obj = DeepCopy(job.data)
    obj.timestamp = job.timestamp
    obj.jobId = job?.opts?.jobId
    obj.queue = job?.que?.name
    if(!obj.id) obj.id = obj.jobId
    if(LOCAL_QUE_KEY && redis) await redis.setTTL(`${LOCAL_QUE_KEY}-${obj.jobId}`, obj, 600)
    await AddJob(obj)
    return obj
  }catch(e){
    throw(e)
  }
}

module.exports = async(job)=>{
  try{
    let res = { status: 'no job data' }
    if(!job?.data) return res
    res.status = 'command not found'
    let obj = await addtoLocalQue(job)
    if(!obj?.data?.name || !CmdMap?.map[obj.data.name]){
      await removeFromLocalQue(obj)
      return res
    }
    if(!Cmds[obj.data.name]) Cmds[obj.data.name] = require('workerCmds/'+obj.data.name)
    res = await Cmds[obj.data.name](obj)
    if(!res) res = {status: 'ok'}
    if(LOCAL_QUE_KEY && redis) await redis.del(`${LOCAL_QUE_KEY}-${obj.jobId}`)
    return res
  }catch(e){
    log.error(e)
  }
}
