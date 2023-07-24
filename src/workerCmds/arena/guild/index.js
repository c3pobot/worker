'use strict'
const { GetOptValue, ReplyMsg } = require('helpers')
const Cmds = {}
Cmds.add = require('./add')
Cmds.edit = require('./edit')
Cmds.remove = require('./remove')
module.exports = async(obj = {}, patreon = {}, opt = [])=>{
  try{
    let tempCmd = GetOptValue(opt, 'option')
    if(tempCmd && Cmds[tempCmd]){
      await Cmds[tempCmd](obj, patreon, opt)
    }else{
      await ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    throw(e)
  }
}
