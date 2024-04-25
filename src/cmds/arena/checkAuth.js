'use strict'
const mongo = require('mongoclient')
const { getDiscordAC, getGuildId } = require('src/helpers')

module.exports = async(dId)=>{
  let guild, auth = 0, obj, allyCode
  let dObj = await getDiscordAC(dId)
  if(dObj?.allyCode) obj = (await mongo.find('patreon', {'users.allyCode': +dObj.allyCode, status: 1}))[0]
  if(obj) auth++
  if(auth == 0){
    let pObj = await getGuildId({dId: dId}, {})
    if(pObj?.guildId) guild = (await mongo.find('guilds', {_id: pObj.guildId, syncArena: 1}))[0]
    if(guild) auth++
    if(pObj?.guildId && auth == 0) guild = (await mongo.find('patreon', {'guilds.id': pObj.guildId, status: 1}))[0]
    if(guild) auth++
  }
  if(auth > 0) return true
}
