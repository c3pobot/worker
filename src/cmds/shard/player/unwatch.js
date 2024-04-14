'use strict'
const mongo = require('mongoclient')
const { getDiscordAC, getOptValue } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: 'You are not part of the shard list'}
  let pObj = (await mongo.find('shardPlayers', {dId: obj.member.user.id, shardId: shard._id}))[0]
  if(!pObj){
    let dObj = await getDiscordAC(obj.member?.user?.id)
    if(dObj?.allyCode) pObj = (await mongo.find('shardPlayers', {_id: dObj.allyCode+'-'+shard._id}))[0]
  }
  if(!pObj) return msg2send
  let rank = getOptValue(opt, 'rank')
  if(rank){
    await mongo.delMany('shardWatch', {pId: pObj.allyCode+'-'+shard._id, rank: rank})
    msg2send.content = 'Rank watch for rank **'+rank+'** has been removed'
  }else{
    await mongo.delMany('shardWatch', {pId: pObj.allyCode+'-'+shard._id})
    msg2send.content = 'You have removed any active rank watches'
  }
  return msg2send
}
