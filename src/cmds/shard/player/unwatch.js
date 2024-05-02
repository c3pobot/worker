'use strict'
const mongo = require('mongoclient')

const { getDiscordAC } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let pObj = (await mongo.find('shardPlayers', { dId: obj.member.user.id, shardId: shard._id }))[0]
  if(!pObj){
    let dObj = await getDiscordAC(obj.member?.user?.id, opt)
    if(dObj?.allyCode) pObj = (await mongo.find('shardPlayers', {_id: dObj.allyCode+'-'+shard._id}))[0]
  }
  if(!pObj) return { content: 'You are not part of the shard list' }

  let rank = opt.rank?.value
  if(rank){
    await mongo.delMany('shardWatch', { pId: pObj.allyCode+'-'+shard._id, rank: rank })
    return { content: 'Rank watch for rank **'+rank+'** has been removed' }
  }else{
    await mongo.delMany('shardWatch', {pId: pObj.allyCode+'-'+shard._id})
    return { content: 'You have removed any active rank watches' }
  }
}
