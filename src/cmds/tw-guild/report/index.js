'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const getUnits = require('./getUnits')
const projection = require('./dbProjection')
const getGuild = require('../getGuild')

const { calcGuildStats, getGuildId, replyButton } = require('src/helpers')
const { formatReportGP, formatReportGuild, formatTWRecord } = require('src/format')

module.exports = async(obj = {}, opt = {})=>{
  let includeUnits = opt.units?.value
  let pObj = await getGuildId({ dId: obj.member?.user?.id }, {}, opt)
  if(!pObj?.guildId) return { content: 'You do not have your allycode linked to discord id' }

  let twStatus = (await mongo.find('twStatus', { _id: pObj.guildId }))[0]
  if(!twStatus?.enemy) return { content: 'there is no opponent guild registerd' }

  await replyButton(obj, 'Fetching guild data...')
  let [ gObj, eObj ] = await Promise.allSettled([
    getGuild(pObj.guildId, twStatus.joined, projection),
    getGuild(twStatus.enemy, [], projection)
  ])
  gObj = gObj?.value, eObj = eObj?.value
  if(!gObj?.member) return { content: 'error getting home guild data' }
  if(!eObj?.member) return { content: 'error getting away guild data' }

  await replyButton(obj, 'Starting the report creation...')

  let glUnits = (await mongo.find('factions', {_id: 'galactic_legend'}))[0]
  let guild = (await mongo.find('guilds', {_id: pObj.guildId }))[0]
  if(!guild) guild = { units: [] }

  let msg2send = { content: null, embeds: [] }
  let baseMsg = { color: 15844367, timestamp: new Date(gObj.updated), title: `TW Report`, description: `[${gObj.name}](https://swgoh.gg/g/${gObj.id}) (${gObj.member.length}) vs [${eObj.name}](https://swgoh.gg/g/${eObj.id}) (${eObj.member.length})`, fields: [], footer: { text: "Data Updated" } }
  baseMsg.fields.push(formatReportGP(gObj, eObj));
  baseMsg.fields.push(formatReportGuild(glUnits.units, gObj, eObj));
  baseMsg.fields.push(formatTWRecord(gObj.recentTerritoryWarResult, eObj.recentTerritoryWarResult));
  msg2send.embeds.push(baseMsg)
  if(includeUnits !== false){
    if(glUnits?.units?.length > 1) await getUnits(glUnits?.units, 'GL', gObj, eObj, msg2send)
    if(guild.units?.filter(x=>x.combatType == 1).length > 0) await getUnits(sorter([{column: 'nameKey', order: 'ascending'}], guild.units.filter(x=>x.combatType == 1))?.map(x=>x.baseId), 'Char', gObj, eObj, msg2send)
    if(guild.units?.filter(x=>x.combatType == 2).length > 0) await getUnits(sorter([{column: 'nameKey', order: 'ascending'}], guild.units.filter(x=>x.combatType == 2))?.map(x=>x.baseId), 'Ship', gObj, eObj, msg2send)
  }
  return msg2send
}
