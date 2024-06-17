'use strict'
const mongo = require('mongoclient')
const { getDiscordAC } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let allyObj = await getDiscordAC(obj.member?.user?.id, opt)
  if(!allyObj?.allyCode) return { content: 'You do not have allycode linked to discordId' }

  let allyCode = allyObj.allyCode

  let pObj = (await mongo.find('defaultUnits', { _id: allyCode.toString() }, { _id: 0, TTL: 0 }))[0]
  if(!pObj?.units || pObj?.units?.length === 0)  return { content: `allyCode ${allyCode} has not default units set` }

  let embedMsg = {
    color: 15844367,
    title: `${allyCode} default units`,
    description: '```\n'
  }
  for(let i in pObj.units){
    embedMsg.description += `${pObj.units[i].nameKey} ${pObj.units[i].gear.nameKey}\n`
  }
  embedMsg.description += '```'
  return { content: null, components: [], embeds: [embedMsg] }
}
