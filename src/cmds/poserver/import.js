'use strict'
module.exports = async(obj, opt)=>{
  try{
    let msg2send = {content: 'Shard Id not provided'}, shardId, players = [], channel, sId = obj.guild_id, catId, shard
    if(opt.find(x=>x.name == 'shardid')) shardId = opt.find(x=>x.name == 'shardid').value.trim()
    if(obj.channel_id) channel = await MSG.GetChannel(obj.channel_id)
    if(channel && channel.parent_id > 999999) catId = channel.parent_id
    if(sId && catId){
      msg2send.content = 'This is not a valid server-category'
      shard = (await mongo.find('payoutServers', {_id: sId+'-'+catId}))[0]
    }
    if(shard){
      if(shardId){
        msg2send.content = 'No shard players found'
        players = await mongo.find('shardPlayers', {shardId: shardId})
      }
      if(players.length > 0){
        msg2send.content = 'Error with provided shardId'
        if(sId && catId){
          let count = 0
          msg2send.content = 'Player import completed\n'
          for(let i in players){
            if(players[i].type == shard.type){
              delete players[i]._id
              delete players[i].shardId
              delete players[i].sId
              delete players[i].catId
              delete players[i].TTL
              players[i].shardId = sId+'-'+catId
              players[i].sId = sId
              players[i].catId = catId
              await mongo.set('shardPlayers', {_id: players[i].allyCode+'-'+sId+'-'+catId}, players[i])
              count++
            }
          }
          msg2send.content += count+' players imported'
        }
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
