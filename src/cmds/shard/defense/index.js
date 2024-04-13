'use strict'
module.exports = async(obj, shard, opt)=>{
  try{
    let msg2send = {content: 'No Shard players found'}, unitType = (shard.type == 'char' ? 2:3)
    const players = await mongo.find('shardRankCache', {shardId: shard._id})
    if(players && players.length > 0){
      msg2send.content = 'Error getting data'
      const leadObj = {}
      for(let i in players){
        if(players[i].arena && players[i].arena[shard.type] && players[i].arena[shard.type].squad){
          const teamLead = players[i].arena[shard.type].squad.find(x=>x.squadUnitType == unitType)
          if(teamLead){
            if(!leadObj[teamLead.unitDefId.split(':')[0]]) leadObj[teamLead.unitDefId.split(':')[0]] = {baseId: teamLead.unitDefId.split(':')[0], count: 0}
            if(leadObj[teamLead.unitDefId.split(':')[0]]) leadObj[teamLead.unitDefId.split(':')[0]].count++
          }
        }
      }
      const sortedObj = await sorter([{column: 'count', order: 'descending'}], Object.values(leadObj))
      if(sortedObj.length > 0){
        const embedMsg = {
          color: 15844367,
          description: (shard.type == 'char' ? 'Squad':'Fleet')+' Arena Team Lead Stats\n```\n'+players.length.toString().padStart(3, ' ')+' : Registered Players\n'
        }
        for(let i in sortedObj){
          const unitName = (unitList[sortedObj[i].baseId] ? unitList[sortedObj[i].baseId].name:sortedObj[i].baseId)
          embedMsg.description += sortedObj[i].count.toString().padStart(3, ' ')+' : '+unitName+'\n'
        }
        embedMsg.description += '```'
        msg2send.content = null
        msg2send.embeds = [embedMsg]
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
