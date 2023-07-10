'use strict'
module.exports = async(obj, opt)=>{
  try{
    let msg2send = {content: 'There are no payout shards'}
    const shards = await mongo.find('payoutServers', {})
    if(shards && shards.length > 0){
      const tempShards = {}
      for(let i in shards){
        const playerCount = await mongo.count('shardPlayers', {shardId: shards[i]._id})
        if(!tempShards[shards[i].shard]) tempShards[shards[i].shard] = {shardNum: shards[i].shard, playerCount: 0, servers: 0}
        if(tempShards[shards[i].shard]){
          tempShards[shards[i].shard].playerCount += +playerCount || 0
          tempShards[shards[i].shard].servers++;
        }
      }
      const sortedArray = await sorter([{column: 'shardNum', order: 'ascending'}], Object.values(tempShards))
      const embedMsg = {
        title: 'Payout Servers',
        color: 15844367,
        fields: []
      }
      let totalPlayers = 0
      for(let i in sortedArray){
        totalPlayers += +sortedArray[i].playerCount || 0
        const tempObj = {
          name: 'Shard '+sortedArray[i].shardNum,
          value: '```\n'
        }
        tempObj.value += 'Servers : '+sortedArray[i].servers+'\n'
        tempObj.value += 'players : '+sortedArray[i].playerCount+'\n'
        tempObj.value += '```'
        embedMsg.fields.push(tempObj)
      }
      embedMsg.title += ' ('+totalPlayers+')'
      msg2send.content = null
      msg2send.embeds = [embedMsg]
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
