'use strict'
const { mongo, AdminNotAuth, CheckServerAdmin, GetOptValue, ReplyMsg } = require('helpers')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'This command requires bot admin'}, roleId, roleName, guild
    let auth = await CheckServerAdmin(obj)
    if(!auth){
      await AdminNotAuth(obj)
      return;
    }
    if(auth){
      msg2send.content = 'No role to add was provided'
      roleId = await GetOptValue(opt, 'role')
    }
    if(roleId){
      msg2send.content = 'Error finding role'
      if(obj.data?.resolved.roles) roleName = obj.data.resolved.roles[roleId]?.name
    }
    if(roleName === '@everyone'){
      msg2send.content = 'You cannot set the **everyone** role as self assign role'
      roleId = null
      roleName = null
    }
    if(roleName && roleId){
      msg2send.content = 'Error getting server info'
      guild = (await mongo.find('discordServer', {_id: obj.guild_id}, {selfassignroles: 1}))[0]
    }
    if(guild){
      msg2send.content = '**@'+roleName+'** is already a self assign role'
      let selfassignroles = []
      if(guild?.selfassignroles) selfassignroles = guild.selfassignroles
      if(selfassignroles.filter(x=>x.id === roleId).length === 0){
        selfassignroles.push({id: roleId, name: roleName})
        await mongo.set('discordServer', {_id: obj.guild_id}, {selfassignroles: selfassignroles})
        msg2send.content = '**@'+roleName+'** was added as a self assign role'
      }
    }
    ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
