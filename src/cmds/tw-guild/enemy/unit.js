'use strict'
const mongo = require('mongoclient')
const getGuild = require('../getGuild')
const sorter = require('json-array-sorter')
const numeral = require('numeral')
const { getGuildId, truncateString, findUnit, getRelicLevel } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let pObj = await getGuildId({ dId: obj.member?.user?.id }, {}, opt)
  if(!pObj?.guildId) return { content: 'You do not have your allycode linked to discord id' }

  let twStatus = (await mongo.find('twStatus', { _id: pObj.guildId }))[0]
  if(!twStatus?.enemy) return { content: 'there is no opponent guild registerd' }

  let unit = opt.unit?.value?.toString()?.trim()
  if(!unit) return { content: 'You did not provide a unit'}

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(uInfo?.msg2send) return uInfo.msg2send
  if(!uInfo.baseId) return { content: `Error finding unit **${unit}**` }

  let gObj = await getGuild(twStatus.enemy, [], { playerId: 1, name: 1, roster: { [uInfo.baseId]: 1 } })
  if(!gObj?.member) return { content: 'error getting away guild data' }

  let { gLevel, rLevel } = getRelicLevel(opt, 0, 0), units = []

  if(uInfo.combatType == 1){
    units = gObj.member.filter(r=>r.roster && r.roster[uInfo.baseId] && r.roster[uInfo.baseId].gearTier >= gLevel && r.roster[uInfo.baseId].relicTier >= rLevel)?.map(m=>{
      return {
        member: m.name,
        rarity: m.roster[uInfo.baseId].rarity,
        gp: m.roster[uInfo.baseId].gp,
        gear: m.roster[uInfo.baseId].gearTier,
        relic: m.roster[uInfo.baseId].relicTier || 0
      }
    })
  }
  if(uInfo.combatType == 2){
    units = gObj.member.filter(r=>r.roster && r.roster[uInfo.baseId])?.map(m=>{
      return {
        member: m.name,
        rarity: m.roster[uInfo.baseId].rarity,
        gp: m.roster[uInfo.baseId].gp
      }
    })
  }
  if(units?.length > 0) units = sorter([{column: 'gp', order: 'descending'}], units)
  if(!units) return { content: 'error getting guild units...' }
  if(units?.length == 0) return { content: `no one in the guild has **${uInfo.nameKey}** at the requested gear/relic level...` }

  let unitsObj = {}
  for(let i in units){
    if(!unitsObj[units[i].rarity]){
      unitsObj[units[i].rarity] = {
        rarity: units[i].rarity,
        players: []
      }
    }
    if(unitsObj[units[i].rarity] && unitsObj[units[i].rarity].players) unitsObj[units[i].rarity].players.push(units[i])
  }
  let array = Object.values(unitsObj)
  if(array?.length > 0) array = sorter([{column: 'rarity', order: 'descending'}], array)
  if(!array || array.length == 0) return { content: 'error sorting guild units...' }

  let msg2send = { content: null, embeds: [] }
  let embedMsg = {
    color: 15844367,
    title: gObj.name+' ('+gObj.member.length+')',
    timestamp: new Date(gObj.updated),
    description: uInfo.nameKey+' (<UNITCOUNT>/'+units.length+')',
    author: {
      icon_url: "https://swgoh.gg/static/img/assets/"+uInfo.thumbnailName+".png"
    },
    thumbnail:{
      url: "https://swgoh.gg/static/img/assets/"+uInfo.thumbnailName+".png"
    },
    footer:{
      text: 'Data Updated'
    }
  }
  if(uInfo.combatType == 1){
    if(rLevel) embedMsg.description += ` - Relic >= ${rLevel}`
    if(!rLevel && gLevel) embedMsg.description += ` - Gear >= ${gLevel}`
  }
  embedMsg.fields = []
  for(let i in array){
    let count = 0, unitCount = 0
    let tempObj = {
      name: array[i].rarity+"★ : ",
      value: "```autohotkey\n GP   : "+(uInfo.combatType ==  1 ? 'G/R : ':'')+"Player\n"
    }
    for(let p in array[i].players){
      tempObj.value += numeral(array[i].players[p].gp/1000).format("0.0").padStart(4, ' ')+"K : "
      if(uInfo.combatType == 1) tempObj.value += (array[i].players[p].relic > 0 ? 'R'+array[i].players[p].relic.toString().padStart(2, '0')+' : ':'G'+array[i].players[p].gear.toString().padStart(2, '0')+' : ')
      tempObj.value += (await truncateString(array[i].players[p].member, 13))+"\n"
      count++
      unitCount++
      if((+p + 1) == array[i].players.length && count < 25) count = 25
      if(count == 25){
        tempObj.value += '```'
        tempObj.name += '('+unitCount+')'
        embedMsg.fields.push(tempObj)
        embedMsg.description = embedMsg.description.replace('<UNITCOUNT>', unitCount)
        if(msg2send.embeds.length < 11) msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
        embedMsg.fields = []
        embedMsg.description = uInfo.nameKey+' (<UNITCOUNT>/'+array.length+')'+(+rLevel > 0 && uInfo.combatType == 1 ? ' - Relic >= '+(+rLevel):'')+(+gLevel > 0 && uInfo.combatType == 1 ? ' - Gear >= '+gLevel:'')
        tempObj.name = array[i].rarity+"★ : "
        tempObj.value = "```autohotkey\n GP   : "+(uInfo.combatType ==  1 ? 'G/R : ':'')+"Player\n"
        count = 0,
        unitCount = 0
      }
    }
  }
  return msg2send
}
