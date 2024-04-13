'use strict'
const mongo = require('mongoclient')
const getGuildId = require('./getGuildId')
const getOptValue = require('../getOptValue')

module.exports = async(obj, opt = [])=>{
  let squad, parentId
  if(botSettings?.squadLink) parentId = botSettings?.squadLink[obj?.guild_id]
  let squadName = getOptValue(opt, 'name')
  if(squadName) squadName = squadName.trim().toLowerCase()
  const squadId = getOptValue(opt, 'squadId')
  if(squadId){
    squad = (await mongo.find('squadTemplate', {_id: squadId}))[0]
  }else{
    if(!squad) squad = (await mongo.find('squadTemplate', {_id: obj.member.user.id+'-'+squadName}))[0]
    if(!squad) squad = (await mongo.find('squadTemplate', {_id: obj.guild_id+'-'+squadName}))[0]
    if(!squad && parentId) squad = (await mongo.find('squadTemplate', {_id: parentId+'-'+squadName}))[0]
    if(!squad){
      const pObj = getGuildId(obj, opt)
      if(pObj?.guildId) squad = (await mongo.find('squadTemplate', {_id: pObj.guildId+'-'+squadName}))[0]
    }
    if(!squad) squad = (await mongo.find('squadTemplate', {_id: 'global-'+squadName}))[0]
  }
  return squad
}
