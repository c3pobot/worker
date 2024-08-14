'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')

const { getGuildId, fetchGuild, replyButton } = require('src/helpers')
const { getUnitDataCrons, getCronCounts } = require('src/helpers/datacrons')

module.exports = async(obj = {}, opt = {})=>{
  let pObj = await getGuildId({ dId: obj.member?.user?.id }, {}, opt)
  if(!pObj?.guildId) return { content: 'You do not have your allycode linked to discord id' }

  await replyButton(obj, 'fetching guild data...')
  let gObj = await fetchGuild({ guildId: pObj.guildId, projection: { playerId: 1, name: 1, datacron: 1 } })
  if(!gObj?.member || gObj?.member?.length == 0) return { content: `error getting guild...` }

  let gCrons = await getUnitDataCrons(gObj.member, {})
  if(!gCrons) return { content: 'error getting guild datacrons' }

  let data = getCronCounts(gCrons, {})
  data = sorter([{ column: 'id', order: 'ascending' }], data || [])

  if(!data || data?.length === 0) return { content: 'Error getting datacron counts' }

  let embedMsg = { color: 15844367, timestamp: new Date(gObj.updated), title: `Datacron Report`, description: `[${gObj.name}](https://swgoh.gg/g/${gObj.id}) (${gObj.member.length})\n`, fields: [], footer: { text: "Data Updated" } }
  for(let i in data){
    embedMsg.description += `${data[i].nameKey}\n`
    embedMsg.description += '```autohotkey\n'
    for(let u in data[i].units){
      if(!data[i]?.units[u]?.nameKey) continue
      embedMsg.description += `${(data[i].units[u].home || 0)?.toString()?.padStart(2, 0)} : ${data[i].units[u].nameKey}\n`
    }
    embedMsg.description += '```\n'
  }
  return { content: null, embeds: [embedMsg]}
}
