'use strict'
const Cache = require('node-cache')
const JobCache = new Cache({stdTTL: 1800, checkperiod: 60})
const Cmds = {}
Cmds.addJob = async(obj = {})=>{
  try{
    if(obj?.jobId) return await JobCache.set(obj.jobId, obj)
  }catch(e){
    throw(e)
  }
}
Cmds.getJob = async(obj = {})=>{
  try{
    if(obj?.jobId) return await JobCache.take(obj.jobId)
  }catch(e){
    throw(e);
  }
}
Cmds.checkJob = async(obj = {})=>{
  try{
    if(obj?.jobId) return await JobCache.get(obj.jobId)
  }catch(e){
    throw(e);
  }
}
Cmds.removeJob = async(jobId)=>{
  try{
    if(jobId) return await JobCache.take(jobId)
  }catch(e){
    throw(e);
  }
}
module.exports = Cmds
