'use strict'
const { log, CheckServerAdmin, AdminNotAuth, GetOptValue, ReplyError, ReplyMsg } = require('helpers')
const log = require('logger')
const Cmds = {}
Cmds.alt = require('./alt')
Cmds.main = require('./main')
Cmds.join = require('./join')
module.exports = async(obj = {})=>{
  try{
    const auth = await CheckServerAdmin(obj)
    if(auth){
      let tempCmd = GetOptValue(obj.data?.options)
      let opt = obj.data?.options
      if(tempCmd && Cmds[tempCmd]){
        await Cmds[tempCmd](obj, opt)
      }else{
        await ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
      }
    }else{
      await AdminNotAuth(obj)
    }
  }catch(e){
    log.error(e)
    ReplyError(obj)
  }
}
