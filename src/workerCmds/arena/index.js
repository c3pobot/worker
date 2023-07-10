'use strict'
const { log, mongo, GetAllyCodeFromDiscordId, GetGuildId, ReplyError, ReplyMsg } = require('helpers')
const CheckAuth = async(dId)=>{
  try{
    let guild, auth = false, obj, allyCode
    const dObj = await GetAllyCodeFromDiscordId(dId)
    if(dObj && dObj.allyCode) obj = (await mongo.find('patreon', {'users.allyCode': +dObj.allyCode, status: 1}))[0]
    if(obj) return true
    let pObj = await GetGuildId({dId: dId}, {})
    if(pObj?.guildId) guild = (await mongo.find('guilds', {_id: pObj.guildId, syncArena: 1}))[0]
    if(guild) return true
    if(pObj?.guildId) guild = (await mongo.find('patreon', {'guilds.id': pObj.guildId, status: 1}))[0]
    if(guild) return true
  }catch(e){
    throw(e)
  }
}
const Cmds = {}
Cmds.guild = require('./guild')
Cmds.notify = require('./notify')
Cmds.settings = require('./settings')
Cmds.show = require('./show')
Cmds.user = require('./user')
module.exports = async(obj = {})=>{
  try{
    let tempCmd, opt
    if(obj.data && obj.data.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].name]){
          tempCmd = obj.data.options[i].name
          opt = obj.data.options[i].options
          break;
        }
      }
    }

    if(tempCmd == 'notify'){
      let auth = await CheckAuth(obj.member.user.id)
      if(auth){
        await Cmds.notify(obj, opt)
      }else{
        ReplyMsg(obj, 'This is only available to patreons or those sponsored by a patreon')
      }
    }else{
      if(tempCmd && Cmds[tempCmd]){
        let patreon = (await mongo.find('patreon', {_id: obj.member.user.id, status: 1}))[0]
        if(patreon){
          await Cmds[tempCmd](obj, patreon, opt)
        }else{
          ReplyMsg(obj, 'This is only avaliable to patreons')
        }
      }else{
        ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
      }
    }
  }catch(e){
    log.error(e)
    ReplyError(obj)
  }
}
