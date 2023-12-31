'use strict'
const log = require('logger')
const { CheckVIP, ReplyError, ReplyMsg } = require('helpers')
const Cmds = {}
Cmds.cr = require('./cr')
module.exports = async(obj = {})=>{
  try{
    let auth = await HP.CheckVIP(obj)
    if(auth > 0){
      let tempCmd, opt = []
      if(obj.data && obj.data.options){
        for(let i in obj.data.options){
          if(Cmds[obj.data.options[i].name]){
            tempCmd = obj.data.options[i].name
            if(obj.data.options[i].options) opt = obj.data.options[i].options
            break;
          }
        }
      }
      if(tempCmd){
        await Cmds[tempCmd](obj, opt)
      }else{
        await ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
      }
    }else{
      await ReplyMsg(obj, {content: 'This command is only for VIP members'})
    }
  }catch(e){
    log.error(e)
    ReplyError(obj)
  }
}
