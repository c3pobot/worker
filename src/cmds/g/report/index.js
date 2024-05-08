'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const getUnits = require('./getUnits')

const { getGuildId, fetchGuild, getPlayerAC, dbProjection } = require('src/helpers')
const { formatReportGP, formatReportGuild, formatTWRecord, formatReportUnit } = require('src/format')

module.exports = async(obj = {}, opt = {})=>{
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
  let allyCode = allyObj?.allyCode
  if(!allyCode) return { content: 'You do not have allyCode linked to discord' }

  let pObj = await getGuildId({}, { allyCode: allyCode }, {})
  if(!pObj.guildId) return { content: `Error getting guildId...` }

  let gObj = await fetchGuild({ guildId: pObj.guildId, projection: dbProjection.guildReport })
  if(!gObj?.member || gObj?.member?.length == 0) return { content: 'error getting guild...' }

  let includeUnits = opt.units?.value || false
  let glUnits = (await mongo.find('factions', {_id: 'galactic_legend'}))[0]

  let guild = (await mongo.find('guilds', {_id: pObj.guildId }))[0]
  if(!guild) guild = { units: [] }
  let msg2send = { content: null, embeds: [] }
  let baseMsg = {
    color: 15844367,
    timestamp: new Date(gObj.updated),
    title: 'Guild Report for '+gObj.name+' ('+gObj.member.length+')',
    fields: [],
    footer: {
      text: "Data Updated"
    }
  }
  baseMsg.fields.push(formatReportGP(gObj, null));
  baseMsg.fields.push(formatReportGuild(glUnits, gObj, null));
  baseMsg.fields.push(formatTWRecord(gObj.recentTerritoryWarResult, null));
  msg2send.embeds.push(baseMsg)
  if(opt.units?.value == true){
    if(glUnits?.units?.length > 1) await getUnits(glUnits?.units, 'GL', gObj, msg2send)
    if(guild.units?.filter(x=>x.combatType == 1).length > 0) await getUnits(sorter([{column: 'nameKey', order: 'ascending'}], guild.units.filter(x=>x.combatType == 1))?.map(x=>x.baseId), 'Char', gObj, msg2send)
    if(guild.units?.filter(x=>x.combatType == 2).length > 0) await getUnits(sorter([{column: 'nameKey', order: 'ascending'}], guild.units.filter(x=>x.combatType == 2))?.map(x=>x.baseId), 'Ship', gObj, msg2send)
  }
  return msg2send
}
