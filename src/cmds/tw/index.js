'use strict'
const Cmds = {}
Cmds['attack-log'] = require('./attack-log')
Cmds.defense = require('./defense')
Cmds.opponent = require('./opponent')
Cmds.member = require('./member')
Cmds.preload = require('./preload')
Cmds.status = require('./status')
Cmds.stats = require('./stats')
const { replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let tempCmd, opt = []
    if(obj.data.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].name]){
          tempCmd = obj.data.options[i].name
          if(obj.data.options[i].options) opt = obj.data.options[i].options
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
