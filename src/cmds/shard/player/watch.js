'use strict'
const mongo = require('mongoclient')

const { getDiscordAC } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let rank = opt.rank?.value
  if(!rank) return { content: 'You did not provide a rank to watch' }

  let pObj = (await mongo.find('shardPlayers', {dId: obj.member.user.id, shardId: shard._id}))[0]
  if(!pObj){
    let dObj = await getDiscordAC(obj.member.user.id)
    if(dObj?.allyCode) pObj = (await mongo.find('shardPlayers', {_id: dObj.allyCode+'-'+shard._id}))[0]
  }
  if(!pObj?.allyCode) return { content: 'You are not part of the shard list' }

  let tempId = +Date.now() + +pObj.allyCode
  let tempObj = {
    allyCode: +pObj.allyCode,
    dId: obj.member.user.id,
    shardId: shard._id,
    pId: pObj.allyCode+'-'+shard._id,
    rank: +rank,
    sId: obj.sId,
    catId: obj.catId,
    method: pObj.notify.method,
    logChannel: shard.logChannel,
    type: shard.type
  }
  await mongo.set('shardWatch', {_id: tempId.toString()}, tempObj)
  return { content: 'You have been set to be notified when player at rank **'+rank+'** moves' }
}
