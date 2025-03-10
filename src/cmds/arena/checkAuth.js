'use strict'
const mongo = require('mongoclient')
const { getDiscordAC, getGuildId } = require('src/helpers')
const { botSettings } = require('src/helpers/botSettings')

module.exports = async(dId)=>{
  if(!dId) return
  if(botSettings?.botSID){
    let subs = (await mongo.find('serverSubscriptions', { _id: botSettings.botSID.toString() }, { arena: 1 }))[0]
    if(subs?.arena?.includes(dId)) return true
  }

  let guild, obj, allyCode
  let dObj = await getDiscordAC(dId)
  if(dObj?.allyCode) obj = (await mongo.find('patreon', {'users.allyCode': +dObj.allyCode, status: 1}))[0]
  if(obj?.status) return true
  let pObj = await getGuildId({ dId: dId }, {})
  if(pObj?.guildId) guild = (await mongo.find('guilds', {_id: pObj.guildId, syncArena: 1}))[0]
  if(guild?.syncArena) return true
  if(pObj?.guildId) guild = (await mongo.find('patreon', {'guilds.id': pObj.guildId, status: 1}))[0]
  if(guild?.status) return true
}
