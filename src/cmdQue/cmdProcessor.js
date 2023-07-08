'use strict'
const { mongo, mongoStatus, AddJob, ReplyError, RemoveJob, ReplyMsg, ReportError } = require('helpers')
const { CmdMap } = require('helpers/cmdMap')
module.exports.process = async(obj ={})=>{
  try{
    if(!obj?.data?.name) return
    if(!CmdMap?.map?.cmdCount) await ReplyMsg({content: 'Oh dear! I am still starting up my services...'})
    await AddJob(obj)
    if(CmdMap?.map[obj.data.name]){
      await require('workerCmds/'+obj.data.name)(obj)
    }else{
      await ReplyMsg(obj, {content: 'Oh dear! **'+obj.data.name+'** command not recognized...'})
    }
    await RemoveJob(obj.jobId)
  }catch(e){
    ReportError(e);
    ReplyError(obj, {content: 'Oh dear! Critical command Error occured...'})
  }
}
module.exports.checkCmdMap = ()=>{
  return CmdMap.map.cmdCount
}
