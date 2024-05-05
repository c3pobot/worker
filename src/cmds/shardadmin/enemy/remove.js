'use strict'
const mongo = require('mongoclient')
const showEnemyWatch = require('./show')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let allyCode = opt.allycode?.value?.toString()?.replace(/-/g, ''), emoji = opt.emoji?.value
  if(shard.enemyWatch){
    if(allyCode) shard.enemyWatch.allyCodes = shard.enemyWatch.allyCodes.filter(x=>x !== +allyCode)
    if(emoji) shard.enemyWatch.emoji = shard.enemyWatch.emoji.filter(x=>x !== emoji)
    if(allyCode || emoji) await mongo.set('payoutServers', {_id: shard._id}, { enemyWatch: shard.enemyWatch })
  }
  return await showEnemyWatch(obj, shard, opt)
}
