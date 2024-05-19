'use strict'
const mongo = require('mongoclient')
const getGuildId = require('./getGuildId')
const checkServerAdmin = async(obj = {})=>{
  if(!obj.member?.user?.id) return [ false, null]
  if(obj.guild?.owner_id == obj.member.user.id) return [ true, null]

  let server = (await mongo.find('discordServer', { _id: obj.guild_id }, { admin:1, guilds: 1 }))[0]
  if(!server?.admin || server?.admin?.length == 0) return [ false, null ]

  let roles = obj.member?.roles
  if(!roles || roles?.length == 0) return [ false, null ]

  if(server.admin.filter(x=>roles.includes(x.id)).length > 0) return [ true, server ]
}

module.exports = async(obj = {}, opt = {}, gObj)=>{
  let [ auth, server ] = await checkServerAdmin(obj)

  if(!auth) return

  let guildId = gObj?.guildId
  if(!guildId){
    let pObj = await getGuildId({ dId: obj?.member?.user?.id }, {}, opt)
    if(pObj?.guildId) guildId = pObj?.guildId
  }
  if(!guildId) return
  if(!server) server = (await mongo.find('discordServer', { _id: obj.guild_id }, { admin: 1, guilds: 1}))[0]
  if(server?.guilds?.filter(x=>x?.guildId == guildId).length > 0) return true
}
