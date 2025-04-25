'use strict'
const mongo = require('mongoclient')
const getGuild = require('./getGuild')
const sorter = require('json-array-sorter')

const { calcGuildStats, getGuildId, replyButton } = require('src/helpers')
const { formatReportGP, formatReportGuild, formatTWRecord } = require('src/format')
const { getUnitDataCrons, getCronCounts } = require('src/helpers/datacrons')

const projection = { playerId: 1, name: 1, datacron: 1 }

module.exports = async(obj = {}, opt = {})=>{
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

  let cronDef = {}
  let [ gCrons, eCrons ] = await Promise.allSettled([
    getUnitDataCrons(gObj.member, cronDef),
    getUnitDataCrons(eObj.member, cronDef)
  ])
  
  gCrons = gCrons?.value, eCrons = eCrons?.value

  if(!gCrons) return { content: 'error getting home guild datacrons' }
  if(!eCrons) return { content: 'error getting away guild datacrons' }

  let data = getCronCounts(gCrons, eCrons)
  data = sorter([{ column: 'id', order: 'ascending' }], data || [])
  if(!data || data?.length === 0) return { content: 'Error getting datacron counts' }

  let embedMsg = { color: 15844367, timestamp: new Date(gObj.updated), title: `Datacron Report`, description: `[${gObj.name}](https://swgoh.gg/g/${gObj.id}) (${gObj.member.length}) vs [${eObj.name}](https://swgoh.gg/g/${eObj.id}) (${eObj.member.length})\n`, fields: [], footer: { text: "Data Updated" } }
  for(let i in data){
    embedMsg.description += `${data[i].nameKey}\n`
    embedMsg.description += '```autohotkey\n'
    for(let u in data[i].units){
      if(!data[i]?.units[u]?.nameKey) continue
      embedMsg.description += `${(data[i].units[u].home || 0)?.toString()?.padStart(2, 0)} vs ${(data[i].units[u].away || 0)?.toString()?.padStart(2, 0)} : ${data[i].units[u].nameKey}\n`
    }
    embedMsg.description += '```\n'
  }
  return { content: null, embeds: [embedMsg]}
}
