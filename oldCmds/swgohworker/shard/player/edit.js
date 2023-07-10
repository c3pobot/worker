'use strict'
const { AddPlayer } = require('./helper')
module.exports = async(obj, shard, opt)=>{
  try{
    let auth = +shard.allowAll || 0, msg2send = {content: 'Editing players requires admin permissions'}, shardPlayer
    if(!auth) auth = await HP.CheckShardAdmin(obj, shard)
    if(auth){
      msg2send.content = 'You did not provide the correct information'
      let allyCode, emoji
      if(opt && opt.find(x=>x.name == 'allycode')) allyCode = opt.find(x=>x.name == 'allycode').value.replace(/-/g, '').toString()
      if(opt && opt.find(x=>x.name == 'emoji')) emoji = opt.find(x=>x.name == 'emoji').value
      if(allyCode) shardPlayer = (await mongo.find('shardPlayers', {_id: allyCode+'-'+shard._id}))[0]
      if(shardPlayer){
        if(emoji){
          await mongo.set('shardPlayers', {_id: allyCode+'-'+shard._id}, {emoji: emoji})
          await mongo.set('shardRankCache', {_id: allyCode+'-'+shard._id}, {emoji: emoji})
        }else{
          await mongo.unset('shardPlayers', {_id: allyCode+'-'+shard._id}, {emoji: shardPlayer.emoji})
          await mongo.unset('shardRankCache', {_id: allyCode+'-'+shard._id}, {emoji: shardPlayer.emoji})
        }
        msg2send.content = 'Player with allyCode **'+allyCode+'** was updated to have '+(emoji ? 'emoji '+emoji:'no emoji')
      }else{
        msg2send.content = 'Could not find shard player with allyCode **'+allyCode+'**'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
