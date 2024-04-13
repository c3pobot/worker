'use strict'
const GetShardName = (type)=>{
  if(type == 'ship'){
    return ('Fleet')
  }else{
    return ('Squad')
  }
}
module.exports = async(obj, shard, opt)=>{
  try{
    let msg2send = {content: 'There are no shard players registered'}, count = 0, sendMsg = 1, pId = [], rankCache
    const shardPlayers = await mongo.find('shardPlayers', {shardId: shard._id}, {_id: 1, name: 1, allyCode: 1, notify: 1, emoji: 1})
    if(shardPlayers?.length > 0) pId = shardPlayers.map(x=>x._id)
    if(pId?.length > 0) rankCache = await mongo.find('shardRankCache', {_id: {$in: pId}}, {_id: 1, rank: 1})
    if(shardPlayers?.length > 0){
      const sortedPlayers = await sorter([{column: 'name', order: 'ascending'}], shardPlayers)
      let fieldLength = 30, numMsgs = 1
      if(+sortedPlayers.length < 30) fieldLength = +sortedPlayers.length
      const embedMsg = {
        color: 15844367,
        description: '',
        timestamp: new Date()
      }
      let count = 0
      for(let i in sortedPlayers){
        let tempRank = rankCache.find(x=>x._id === sortedPlayers[i]._id)?.rank || 0
        if(i == 0){
          embedMsg.title = GetShardName(shard.type)+' Arena Registerd Players'
          embedMsg.description = 'Found '+sortedPlayers.length+' players\nallyCode : notify : rank : name\n'
        }
        embedMsg.description += '`'+sortedPlayers[i].allyCode+'`: '+sortedPlayers[i].notify.status+' : '+tempRank+' : '+(sortedPlayers[i].emoji ? sortedPlayers[i].emoji:'')+HP.TruncateString(sortedPlayers[i].name, 15)+'\n';
        count++
        if(+i + 1 == shardPlayers.length && count < fieldLength) count = +fieldLength
        if(count == fieldLength){
          await MSG.WebHookMsg(obj.token, {embeds: [JSON.parse(JSON.stringify(embedMsg))]}, 'POST')
          delete embedMsg.title
          embedMsg.description = 'allyCode : notify : name\n'
          count = 0
        }
      }
      sendMsg = 0
      HP.RemoveJob(obj.id)
    }
    if(sendMsg) HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
