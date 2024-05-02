'use strict'
const log = require('logger')
const mongo = require('mongoclient')

const { confirmButton } = require('src/helpers')

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

module.exports = async(obj = {}, shard = {}, opt = {}, auth)=>{
  if(!auth) return {content: 'This command requires shard admin privileges' }
  let startRank = opt.rank?.value, emoji = opt.emoji?.value
  if(!startRank) return { content: 'you did not provide a starting rank' }
  if(!obj.confirm){
    await confirmButton(obj, 'Are you sure you want to remove players '+(emoji ? 'with emoji '+emoji:'')+' at rank **'+startRank+'** and higher?');
    return
  }
  if(obj.confirm?.response !== 'yes') return { content: 'Command Canceled' }
  if(obj.confirm?.response === 'yes'){
    let players = await mongo.find('shardRankCache', { shardId: shard._id })
    if(!players || players?.length  == 0) return { content: 'error getting players' }
    players = players.filter(x=>x.rank >= startRank)
    if(emoji) players = players.filter(x=>x.emoji == emoji)
    for(let i in players){
      await mongo.del('shardRankCache', {_id: players[i]._id})
      await mongo.del('shardPlayers', {_id: players[i]._id})
      deleteCachedPlayer(players[i]._id, 10)
    }
    return { content: 'Shard players at rank **'+startRank+'** and higher '+(emoji ? 'with emoji '+emoji:'')+' have been removed from the list' }
  }
  return { content: 'Command Canceled' }
}
