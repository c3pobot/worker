'use strict'
module.exports = async(obj, opt)=>{
  try{
    let msg2send = {content: 'You did not provide a shard number'}, id
    if(opt.find(x=>x.name == 'id')) id = +opt.find(x=>x.name == 'id').value
    if(id >= 0){
      msg2send.content = 'There are no payout servers on shard **'+id+'**'
      const shards = await mongo.find('payoutServers', {shard: id})
      if(shards && shards.length > 0){
        const embedMsg = {
          title: 'Payout Servers Shard '+shards[0].shard+' Info',
          color: 15844367,
          fields: []
        }
        let playerCount = 0
        for(let i in shards){
          const guild = await MSG.GetGuild(shards[i].sId)
          const pCount = await mongo.count('shardPlayers', {shardId: shards[i]._id})
          playerCount += +pCount || 0
          const tempObj = {
            name: guild.name,
            value: '```\n'
          }
          tempObj.value += 'ID      : '+shards[i]._id+'\n'
          tempObj.value += 'sId     : '+shards[i].sId+'\n'
          tempObj.value += 'catId   : '+shards[i].catId+'\n'
          tempObj.value += 'type    : '+shards[i].type+'\n'
          tempObj.value += 'players : '+players.length+'\n'
          tempObj.value += '```'
          embedMsg.fields.push(tempObj)
        }
        embedMsg.title += ' ('+playerCount+')'
        msg2send.content = null
        msg2send.embeds = [embedMsg]
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
