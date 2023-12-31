'use strict'
const mongo = require('mongoclient')
const { ReplyMsg, GetOptValue } = require('helpers')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'error with the provided info'}, roleName
    const roleId = await GetOptValue(opt, 'role')
    if(roleId){
      msg2send.content = 'You did not provide a role'
      if(obj.data && obj.data.resolved && obj.data.resolved.roles && obj.data.resolved.roles[roleId]){
        msg2send.content = 'You cannot set the @ everyone role as bot server admin role'
        if(obj.data.resolved.roles[roleId].name != '@everyone') roleName = obj.data.resolved.roles[roleId].name
      }
    }
    if(roleName){
      msg2send.content = '**@'+roleName+'** is already a bot server admin role'
      const guild = (await mongo.find('discordServer', {_id: obj.guild_id}))[0]
      if(!guild || (guild && (!guild.admin || guild.admin.filter(x=>x.id == roleId).length == 0))){
        await mongo.push('discordServer', {_id: obj.guild_id}, {admin: {id: roleId}})
        msg2send.content = '**@'+roleName+'** was added as a bot server admin role'
      }
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
