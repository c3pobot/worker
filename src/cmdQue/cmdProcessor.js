'use strict'
const log = require('logger');
const jobCache = require('helpers/jobCache');
const { checkCmdMap } = require('helpers/cmdMap')
let Cmds = {}
module.exports = async(obj = {})=>{
  try{
    if(!obj?.data || !obj?.data?.name) return
    if(!obj.jobId) obj.jobId = obj.token
    if(!obj.timestamp) obj.timestamp = obj.timestamp
    await jobCache.addJob(obj)
    let cmdExists = checkCmdMap(obj.data.name)
    if(!cmdExists) return
    if(!Cmds[obj.data.name]) Cmds[obj.data.name] = require(`src/cmds/${obj.data.name}`)
    await Cmds[obj.data.name](obj)
  }catch(e){
    log.error(e)
  }
}
