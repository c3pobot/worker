'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, opt = {})=>{
  let roleId = opt.role?.value
  let role = opt.role.data
  if(!roleId || !role) return { content: 'you did not provide a role'}

  let guild = (await mongo.find('discordServer', { _id: obj.guild_id }))[0]
  if(!guild?.admin || guild?.admin?.filter(x=>x.id == roleId).length == 0) return { content: `**@${role.name}** is not a bot admin role...` }

  await mongo.set('discordServer', { _id: obj.guild_id }, { admin: guild.admin.filter(x=>x.id !== roleId) })
  return { content: `**@${role.name}** was removed as a bot admin role...` }
}
