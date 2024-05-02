'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, opt = {})=>{
  let roleId = opt.role?.value
  let role = opt.role.data
  if(!roleId || !role) return { content: 'you did not provide a role'}

  if(role.name == '@everyone') return { content: `You cannot set @ everyone as admin role...`}

  let guild = (await mongo.find('discordServer', {_id: obj.guild_id}))[0]
  if(!guild || (guild && (!guild.admin || guild.admin.filter(x=>x.id == roleId).length == 0))){
    await mongo.push('discordServer', { _id: obj.guild_id }, { admin: { id: roleId } })
    return { content: '**@'+role.name+'** was added as a bot server admin role' }
  }
  return { content: '**@'+role.name+'** is already a bot server admin role' }
}
