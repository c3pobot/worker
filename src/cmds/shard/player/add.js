'use strict'
const { AddPlayer } = require('./helper')
module.exports = async(obj, shard, opt)=>{
  try{
    let auth = +shard.allowAll || 0, msg2send = {content: 'Adding players requires admin permissions'}
    if(!auth) auth = await HP.CheckShardAdmin(obj, shard)
    if(auth){
      const playerCount = await mongo.find('shardPlayers', {shardId: shard._id}, {allyCode: 1, name: 1})
      if(playerCount && playerCount.length < shard.shardLimit){
        let allyCode, pObj, emoji
        if(opt && opt.find(x=>x.name == 'allycode')) allyCode = opt.find(x=>x.name == 'allycode').value.replace(/-/g, '').toString()
        if(opt && opt.find(x=>x.name == 'emoji')) emoji = opt.find(x=>x.name == 'emoji').value
        if(allyCode) pObj = (await mongo.find('shardPlayers', {_id: allyCode+'-'+shard._id}))[0]
        if(!pObj && allyCode){
          pObj = await Client.post('getArenaPlayer', {allyCode: allyCode}, null)
          if(pObj && pObj.allyCode){
            await AddPlayer(shard, pObj, emoji)
            msg2send.content = '**'+pObj.name+'** with allyCode **'+pObj.allyCode+'** was added '+(emoji ? 'with emoji '+emoji+' ':'')+' to the shard list'
          }else{
            msg2send.content = 'Error finding player with allyCode **'+allyCode+'**'
          }
        }else{
          msg2send.content = '**'+pObj.name+'** has already been added to the shard'
        }
      }else{
        msg2send.content = 'You are limited to **'+shard.shardLimit+'** registered shard players. You currently have **'+playerCount.length+'**'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
