'use strict'
const mongo = require('mongoclient')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let remove = getOptValue(opt, 'stat', 'all')
  let msg2send = {content: remove+' stats have been cleared'}
  if(remove === 'all'){
    await mongo.delMany('shardHitList', {shardId: shard._id})
  }else{
    if(remove === 'skips') await mongo.setMany('shardHitList', {shardId: shard._id}, {enemySkip: 0})
    if(remove === 'hits') await mongo.setMany('shardHitList', {shardId: shard._id}, {enemy: 0})
    if(remove === 'early') await mongo.setMany('shardHitList', {shardId: shard._id}, {early: 0})
  }
  return msg2send
}
