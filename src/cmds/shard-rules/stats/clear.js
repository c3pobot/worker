'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let remove = opt.stat?.value || 'all'
  if(remove === 'all'){
    await mongo.delMany('shardHitList', {shardId: shard._id})
  }else{
    if(remove === 'skips') await mongo.setMany('shardHitList', {shardId: shard._id}, {enemySkip: 0})
    if(remove === 'hits') await mongo.setMany('shardHitList', {shardId: shard._id}, {enemy: 0})
    if(remove === 'early') await mongo.setMany('shardHitList', {shardId: shard._id}, {early: 0})
  }
  return { content: remove+' stats have been cleared' }
}
