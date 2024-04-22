'use strict'
const mongo = require('mongoclient')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'error with the provided info'}, roleName
  let roleId = getOptValue(opt, 'role')
  if(opt.find(x=>x.name == 'role')) roleId = opt.find(x=>x.name == 'role').value
  if(roleId){
    msg2send.content = 'You did not provide a role'
    if(obj.data && obj.data.resolved && obj.data.resolved.roles && obj.data.resolved.roles[roleId]){
      roleName = obj.data.resolved.roles[roleId].name
      if(roleName == '@everyone') roleName = ' everyone'
    }
  }
  if(roleName){
    msg2send.content = '**@'+roleName+'** is not a bot server admin role'
    const guild = (await mongo.find('discordServer', {_id: obj.guild_id}))[0]
    if(guild?.admin?.filter(x=>x.id == roleId).length > 0){
      await mongo.pull('discordServer', {_id: obj.guild_id}, {admin: {id: roleId}})
      msg2send.content = '**@'+roleName+'** was removed as a bot server admin role'
    }
  }
  return msg2send
}
