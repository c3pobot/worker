'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: 'No Shard players found'}, unitType = (shard.type == 'char' ? 2:3)
  let players = await mongo.find('shardRankCache', {shardId: shard._id})
  if(players && players.length > 0){
    msg2send.content = 'Error getting data'
    let leadObj = {}
    for(let i in players){
      if(players[i].arena && players[i].arena[shard.type] && players[i].arena[shard.type].squad){
        let teamLead = players[i].arena[shard.type].squad.find(x=>x.squadUnitType == unitType)
        if(teamLead){
          if(!leadObj[teamLead.unitDefId.split(':')[0]]) leadObj[teamLead.unitDefId.split(':')[0]] = {baseId: teamLead.unitDefId.split(':')[0], count: 0}
          if(leadObj[teamLead.unitDefId.split(':')[0]]) leadObj[teamLead.unitDefId.split(':')[0]].count++
        }
      }
    }
    let sortedObj = sorter([{column: 'count', order: 'descending'}], Object.values(leadObj))
    if(sortedObj.length > 0){
      let embedMsg = {
        color: 15844367,
        description: (shard.type == 'char' ? 'Squad':'Fleet')+' Arena Team Lead Stats\n```\n'+players.length.toString().padStart(3, ' ')+' : Registered Players\n'
      }
      for(let i in sortedObj){
        let unitName = (unitList[sortedObj[i].baseId] ? unitList[sortedObj[i].baseId].name:sortedObj[i].baseId)
        embedMsg.description += sortedObj[i].count.toString().padStart(3, ' ')+' : '+unitName+'\n'
      }
      embedMsg.description += '```'
      msg2send.content = null
      msg2send.embeds = [embedMsg]
    }
  }
  return msg2send
}
