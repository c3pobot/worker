'use strict'
const { log, ReplyError, ReplyMsg } = require('helpers')
const GetData = require('./getData')
const Cmds = {}
Cmds.unit = require('./unit')
Cmds.journey = require('./journey')
module.exports = async(obj = {})=>{
  try{
    let sendMsg = false, tempCmd, opt = [], msg2send = {content: 'You do not have google/code auth linked to your discordId'}
    if(obj.data?.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].name]){
          tempCmd = obj.data.options[i].name
          if(obj.data.options[i].options) opt = obj.data.options[i].options
          break;
        }
      }
    }
    if(tempCmd){
      let pObj = await GetData(obj, opt)
      if(pObj === 'GETTING_CONFIRMATION') return;
      if(pObj?.msg2send) msg2send.content = pObj.msg2send
      if(pObj?.data){
        sendMsg = false
        await Cmds[tempCmd](obj, opt, pObj.data)
      }else{
        sendMsg = true
      }
    }else{
      sendMsg = true
      msg2send.content = 'Command not found'
    }
    if(sendMsg) ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    log.error(e);
    ReplyError(obj)
  }
}
