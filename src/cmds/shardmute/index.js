'use strict'
const mongo = require('mongoclient')
const { getDiscordAC, replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let opt = obj.data?.options || {}
    let shardType = opt.type?.value
    if(!shardType) return { content: 'you did not provide a shard type' }

    let dObj = await getDiscordAC(obj.member.user.id, opt)
    let shardPlayer = await mongo.find('shardPlayers', { dId: obj.member.user.id, type: shardType })
    if(shardPlayer?.length > 0){
      for(let i in shardPlayer) await mongo.set('shardPlayers', { _id: shardPlayer[i]._id }, {'notify.status': 0})
    }
    if(dObj?.allyCode){
      let dPlayer = await mongo.find('shardPlayers', { allyCode: +dObj.allyCode, type: shardType })
      if(dPlayer?.length > 0){
        for(let i in dPlayer) await mongo.set('shardPlayers', { _id: dPlayer[i]._id }, {'notify.status': 0})
      }
    }
    return { content: 'All notifications for **'+shardType+'** area shard tracker have been disabled. They can only be reenabled in the shard chat' }
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
