'use strict'
const mongo = require('mongoclient')
const { getDiscordAC, getOptValue, replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let opt = obj.data?.options || [], msg2send = {content: 'You must provide a shard type'}
    let shardType = getOptValue(opt, 'type')
    let dObj = await getDiscordAC(obj.member.user.id, opt)
    if(!shardType) return msg2send
    let shardPlayer = await mongo.find('shardPlayers', {dId: obj.member.user.id, type: shardType})
    if(shardPlayer && shardPlayer.length > 0){
      for(let i in shardPlayer){
        await mongo.set('shardPlayers', {_id: shardPlayer[i]._id}, {'notify.status': 0})
      }
    }
    if(dObj?.allyCode){
      let dPlayer = await mongo.find('shardPlayers', {allyCode: +dObj.allyCode, type: shardType})
      if(dPlayer?.length > 0){
        for(let i in dPlayer){
          await mongo.set('shardPlayers', {_id: dPlayer[i]._id}, {'notify.status': 0})
        }
      }
    }
    msg2send.content = 'All notifications for **'+shardType+'** area shard tracker have been disabled. They can only be reenabled in the shard chat'

    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
