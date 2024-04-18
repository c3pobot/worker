'use strict'
const mongo = require('mongoclient')
const log = require('logger')
const deleteCachedPlayer = async(pId, count = 10)=>{
  try{
    let obj = (await mongo.find('shardRankCache', {_id: pId}))[0]
    if(obj) await mongo.del('shardRankCache', {_id: pId})
    count--
    if(count > 0) setTimeout(()=>DeleteCachedPlayer(pId, count), 10000)
  }catch(e){
    log.error(e)
    setTimeout(()=>DeleteCachedPlayer(pId, count), 10000)
  }
}
const { getOptValue, replyButton, confirmButton } = require('src/helpers')
module.exports = async(obj = {}, shard = {}, opt = [], auth)=>{
  let msg2send = {content: 'This command requires shard admin privileges'}
  if(!auth) return msg2send
  msg2send.content = 'you did not provide the correct information'
  let cmdConfirm = obj.confirm?.response
  let startRank = getOptValue(opt, 'rank')
  let emoji = getOptValue(opt, 'emoji')
  if(!startRank) return { content: 'you did not provide a starting rank' }
  if(!cmdConfirm){
    await confirmButton(obj, 'Are you sure you want to remove players '+(emoji ? 'with emoji '+emoji:'')+' at rank **'+startRank+'** and higher?'), players
    return
  }
  if(cmdConfirm !== 'yes'){
    msg2send.content = 'Command Canceled'
    msg2send.components = []
    return msg2send
  }
  if(cmdConfirm === 'yes'){
    await replyButton(obj, 'Pruning shard players at rank **'+startRank+'** and higher...')
    msg2send.content = 'Error getting shard players'
    players = await mongo.find('shardRankCache', {shardId: shard._id})
  }
  if(players?.length > 0){
    msg2send.content = 'Shard players at rank **'+startRank+'** and higher '+(emoji ? 'with emoji '+emoji:'')+' have been removed from the list'
    players = players.filter(x=>x.rank >= startRank)
    if(emoji) players = players.filter(x=>x.emoji == emoji)
    for(let i in players){
      await mongo.del('shardRankCache', {_id: players[i]._id})
      await mongo.del('shardPlayers', {_id: players[i]._id})
      deleteCachedPlayer(players[i]._id, 10)
    }
  }
  return msg2send
}
