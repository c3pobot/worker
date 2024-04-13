'use strict'
const { replyMsg, replyError } = require('src/helpers')
const Cmds = {}
Cmds.add = require('./add')
Cmds.auth = require('./auth')
Cmds.clean = require('./clean')
Cmds.remove = require('./remove')
Cmds.set = require('./set')
Cmds.show = require('./show')

module.exports = async(obj = {})=>{
  try{
    let tempCmd, opt = []
    if(!tempCmd && obj.data.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].name]){
          tempCmd = obj.data.options[i].name
          if(obj.data.options[i].options) opt = obj.data.options[i].options
          break;
        }
      }
    }
    let msg2send = {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
    if(msg2send) await replyMsg(obj, msg2send)
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
