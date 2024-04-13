'use strict'
const log = require('logger')
const checkGuildAdmin = require('./checkGuildAdmin')
const replyMsg = require('./replyMsg')
const replyError = require('./replyError')
const Cmds = {}
Cmds.add = require('./add')
Cmds.remove = require('./remove')

module.exports = async(obj, opt = [])=>{
  try{
    let tempCmd
    if(opt.find(x=>x.name == 'option')) tempCmd = opt.find(x=>x.name == 'option').value
    if(!tempCmd || !Cmds[tempCmd]){
      await replyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
      return
    }
    let guildAmin = await checkGuildAdmin(obj, opt, null)
    if(guildAmin){
      await Cmds[tempCmd](obj, opt)
      return
    }
    await replyMsg(obj, {content: "This command is only avaliable to guild Admins"})
  }catch(e){
    log.error(e)
    replyError(obj)
  }
}
