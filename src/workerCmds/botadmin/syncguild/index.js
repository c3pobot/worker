'use strict'
const { GetOptValue, ReplyMsg } = require('helpers')
const Cmds = {}
Cmds.add = require('./add')
Cmds.remove = require('./remove')
module.exports = async(obj, opt = [])=>{
  try{
    let tempCmd = GetOptValue(opt, 'action')
    if(tempCmd){
      await Cmds[tempCmd](obj, opt)
    }else{
      await ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    throw(e)
  }
}
