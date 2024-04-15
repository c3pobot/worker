'use strict'
const Cmds = {}
Cmds.auto = require('./auto')
Cmds.missed = require('./missed')
Cmds.mom = require('./mom')
Cmds.sendmessages = require('./sendmessages')
Cmds.check = require('./check')
const { replyError } = require('src/helpers')
module.exports = async(obj = {})=>{
  try{
    let opt = [], tempCmd
    for(let i in obj.data.options){
      if(Cmds[obj.data.options[i].name]){
        tempCmd = obj.data.options[i].name
        if(obj.data.options[i].options) opt = obj.data.options[i].options
        break;
      }
    }
    let msg2send = {content: 'Command not recognized'}
    if(tempCmd) msg2send = await Cmds[tempCmd](obj, opt)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
