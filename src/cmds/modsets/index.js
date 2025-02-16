'use strict'
const mongo = require('mongoclient')
const { replyError } = require('src/helpers')
const sorter = require('json-array-sorter')

module.exports = async(obj = {})=>{
  try{
    let opt = obj.data?.options || {}
    let modSet = +(opt['mod-set']?.value?.toString()?.trim() || 0)
    if(!modSet) return { content: 'you did not provided the needed information...' }

    let data = (await mongo.find('modSetRecommendation', { _id: modSet }))[0]
    if(!data?.units) return { content: `Error finding recommendation with the provided information...` }

    let units = sorter([{column: 'count', order: 'descending'}], Object.values(data.units) || [])
    if(!units || units.length == 0) return { content: 'Error finding units with that type of mod set...' }

    let embedMsg = { color: 15844367, description: 'Where others are using ' }
    embedMsg.description += `${data.nameKey} mods.\n${data.count} equipped on ${units.length} different units.\n`
    if(units?.length > 50) embedMsg.description += 'Showing top 25 units.\n'
    embedMsg.description += '```\n'
    let x = units.length
    if(x > 50) x = 50
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
