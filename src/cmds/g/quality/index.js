'use strict'
const { getPlayerAC, getGuildId, fetchGuild } = require('src/helpers')
const sorter = require('json-array-sorter')
const numeral = require('numeral')

module.exports = async(obj = {}, opt = {})=>{
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
  let allyCode = allyObj?.allyCode
  if(!allyCode) return { content: 'You do not have allyCode linked to discord' }

  let pObj = await getGuildId({}, { allyCode: +allyCode }, {})
  if(!pObj?.guildId) return { content: `error getting guildId...` }

  let gObj = await fetchGuild({ guildId: pObj.guildId, projection: { playerId: 1, name: 1, quality: 1 } })
  if(!gObj?.members || gObj?.members?.length == 0) return { content: 'error getting guild...' }

  let sortOrder = opt.sort?.value || 'mods', guildTotal = {
    mods: 0,
    gear: 0,
    total: 0,
    top: 0
  }
  let array = gObj.member.map(m=>{
    guildTotal.mods += (m.quality.mods || 0)
    guildTotal.gear += (m.quality.gear || 0)
    guildTotal.total += ((m.quality.mods || 0) + (m.quality.gear || 0))
    guildTotal.top += (m.quality.top || 0)
    return Object.assign({}, {
      name: m.name,
      mods: (m.quality.mods || 0),
      gear: (m.quality.gear || 0),
      total: ((m.quality.mods || 0) + (m.quality.gear || 0)),
      top: (m.quality.top || 0)
    })
  });
  if(array?.length > 0) array = sorter([{column: sortOrder, order: 'descending'}], array)
  if(!array || array.length == 0) return { content: 'Error getting stats...' }

  let embedMsg = {
    color: 3447003,
    timestamp:new Date(),
    title: gObj.name+' Roster Quality ('+gObj.member.length+') sorted by '+sortOrder,
    description: '```autohotkey\n'+' Mod : Gear : Tot  : Top 80 Mod : Name\n'
  }
  embedMsg.description += numeral(guildTotal.mods / +gObj.member.length).format('0.00')+' : '+numeral(guildTotal.gear / +gObj.member.length).format('0.00')+' : '+numeral(guildTotal.total / +gObj.member.length).format('0.00')+' : '+numeral(guildTotal.top / +gObj.member.length).format('0.00')+' : Guild Average\n'
  for(let m in array){
    let modQuality = numeral(array[m].mods).format('0.00')
    let gearQuality = numeral(array[m].gear).format('0.00')
    let totalQuality = numeral(array[m].total).format('0.00')
    let top80Quality = numeral(array[m].top).format('0.00')
    embedMsg.description += (modQuality.length > 4 ? modQuality.substring(0,4):modQuality)+' : '+(gearQuality.length > 4 ? gearQuality.substring(0,4):gearQuality)+' : '+(totalQuality.length > 4 ? totalQuality.substring(0,4):totalQuality)+' : '+(top80Quality.length > 4 ? top80Quality.substring(0,4):top80Quality)+' : '+(array[m].name.length > 10 ? array[m].name.substring(0, 10):array[m].name)+'\n'
  }
  return { content: null, embeds: [embedMsg] }
}
