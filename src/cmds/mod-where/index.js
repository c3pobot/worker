'use strict'
const mongo = require('mongoclient')
const { replyError } = require('src/helpers')
const sorter = require('json-array-sorter')

module.exports = async(obj = {})=>{
  try{
    let opt = obj.data?.options || {}
    let modSet = opt['mod-set']?.value?.toString()?.trim()
    let modSlot = opt['mod-slot']?.value?.toString()?.trim()
    let modStat = opt['mod-stat']?.value?.toString()?.trim()
    if(!modSet || !modSlot || !modStat) return { content: 'you did not provided the needed information...' }

    let data = (await mongo.find('modTypeRecommendation', { _id: `${modSet}-${modSlot}-${modStat}`}))[0]
    if(!data?.units) return { content: `Error finding recommendation with the provided information...` }

    let units = sorter([{column: 'count', order: 'descending'}], Object.values(data.units) || [])
    if(!units || units.length == 0) return { content: 'Error finding units with that type of mod...' }

    let embedMsg = { color: 15844367, description: 'Where others are using ' }
    embedMsg.description += `${data.setNameKey} ${data.slotNameKey} ${data.statNameKey} mods.\n${data.count} equipped on ${units.length} different units.\n`
    if(units?.length > 25) embedMsg.description += 'Showing top 25 units.\n'
    embedMsg.description += '```\n'
    let x = units.length
    if(x > 25) x = 25
    for(let i = 0;i<x;i++){
      if(!units[i]) continue
      embedMsg.description += `${units[i].count} : ${units[i].nameKey}\n`
    }
    embedMsg.description += '```'
    embedMsg.description += 'Note: Data is from top 1000 players in Kyber and limited to top 25 units'
    return { content: '', embeds: [embedMsg]}

  }catch(e){
    replyError(obj)
    throw(e)
  }
}
