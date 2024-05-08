'use strict'
const mongo = require('mongoclient')
const getGuildId = require('../getGuildId')
const { botSettings } = require('src/helpers/botSettings')
module.exports = async(obj = {}, opt = {})=>{
  let parentId
  if(botSettings?.squadLink) parentId = botSettings?.squadLink[obj?.guild_id]
  let squadName = opt.name?.value?.toString()?.trim()?.toLowerCase(), squadId = opt.squadId?.value
  
  if(!squadId && !squadName) return
  if(squadId) return (await mongo.find('squadTemplate', {_id: squadId}))[0]
  let squad = (await mongo.find('squadTemplate', {_id: obj.member.user.id+'-'+squadName}))[0]
  if(!squad) squad = (await mongo.find('squadTemplate', {_id: obj.guild_id+'-'+squadName}))[0]
  if(!squad && parentId) squad = (await mongo.find('squadTemplate', {_id: parentId+'-'+squadName}))[0]
  if(!squad){
    let pObj = getGuildId({ dId: obj.member?.user?.id }, opt)
    if(pObj?.guildId) squad = (await mongo.find('squadTemplate', {_id: pObj.guildId+'-'+squadName}))[0]
  }
  if(!squad) squad = (await mongo.find('squadTemplate', {_id: 'global-'+squadName}))[0]
  return squad
}
