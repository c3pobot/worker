'use strict'
const { log, ReplyError, ReplyMsg } = require('helpers')
const GetData = require('./getData')
const Cmds = {}
Cmds.discs = require('./discs')
Cmds.feats = require('./feats')
Cmds.stamina = require('./stamina')
module.exports = async(obj = {})=>{
  try{
    let sendMsg = false, tempCmd, getCache = false, opt = [], msg2send = {content: 'You do not have google/code auth linked to your discordId'}
    if(obj?.data?.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].name]){
          tempCmd = obj.data.options[i].name
          if(obj.data.options[i].options) opt = obj.data.options[i].options
        }
      }
    }
    if(tempCmd){
      let cqData = await GetData(obj, opt)
      if(cqData === 'GETTING_CONFIRMATION') return;
      if(cqData?.msg2send) msg2send.content = cqData.msg2send
      if(cqData?.data){
        await Cmds[tempCmd](obj, opt, cqData.data)
      }else{
        sendMsg = true
      }
    }else{
      msg2send.content = 'Command not found'
      sendMsg = true
    }
    if(sendMsg) await ReplyMsg(obj, msg2send)
  }catch(e){
    log.error(e);
    ReplyError(obj)
  }
}
