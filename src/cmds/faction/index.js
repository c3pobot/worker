'use strict'
const Cmds = {}
Cmds.basic = require('./basic')
Cmds.stats = require('./stats')
Cmds.compare = require('./compare')
const { replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let tempCmd, opt
    if(obj.data.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].name]){
          tempCmd = obj.data.options[i].name
          opt = obj.data.options[i].options
        }
      }
    }
    let msg2send = {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
