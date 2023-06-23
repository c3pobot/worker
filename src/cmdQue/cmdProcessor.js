'use strict'
let CmdMap = {}, cmdCount = 0
let workerTypes = ['discord']
if(process.env.WORKER_TYPES) workerTypes = JSON.parse(process.env.WORKER_TYPES)
const UpdateCmdMap = async(notify = false)=>{
  try{
    let tempMap = {}
    for(let i in workerTypes){
      if(notify) console.log('Add '+workerTypes[i]+' commands...')
      const obj = (await mongo.find('slashCmds', {_id: workerTypes[i]}))[0]
      if(obj?.cmdMap) tempMap = {...tempMap,...obj.cmdMap}
    }
    if(Object.values(tempMap)?.length > 0){
      cmdCount = +Object.values(tempMap)?.length
      CmdMap = tempMap
      if(notify) console.log('Saving map to CmdMap')
    }
  }catch(e){
    console.error(e);
  }
}
const SyncCmdMap = async(notify = false)=>{
  try{
    if(notify) console.log('Creating command map...')
    let time = 5000
    if(mongoReady > 0){
      time = 60000
      await UpdateCmdMap(notify)
    }
    setTimeout(SyncCmdMap, time)
  }catch(e){
    console.error(e);
    setTimeout(SyncCmdMap, 5000)
  }
}
SyncCmdMap(true)
module.exports.process = async(obj ={})=>{
  try{
    if(!obj?.data?.name) return
    if(cmdCount === 0) await HP.ReplyMsg({content: 'Oh dear! I am still starting up my services...'})
    await HP.AddJob(obj)
    if(CmdMap[obj.data.name]){
      await require(baseDir+'/src/cmds/'+obj.data.name)(obj)
    }else{
      await HP.ReplyMsg(obj, {content: 'Oh dear! **'+obj.data.name+'** command not recognized...'})
    }
    await HP.RemoveJob(obj.jobId)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj, {content: 'Oh dear! Critical command Error occured...'})
  }
}
module.exports.checkCmdMap = ()=>{
  return cmdCount
}
