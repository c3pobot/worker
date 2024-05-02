'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const countLimit = +process.env.SHARD_STAT_COUNT_LIMIT || 100

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let show = opt.stat?.value || 'all'
  let stats = await mongo.find('shardHitList', { shardId: shard._id })
  if(!stats || stats?.length == 0) return { content: 'There are no stats available' }

  let players = await mongo.find('shardPlayers', { shardId: shard._id })
  if(!players || players?.length == 0) return { content: 'error finding shard players' }
  let msg2send = { content: 'There are no stats available', embeds: [] }
  if((show == 'all' || show == 'hits') && stats.filter(x=>x.enemy > 0).length > 0){
    let count = 0, hits = sorter([{column: 'enemy', order: 'descending'}], stats.filter(x=>x.enemy > 0)), countPad = 3
    let hitsMsg = {
      color: 15844367,
      title: 'Shard Enemy Hits stats',
      description: ''
    }
    if(hits.length > countLimit)  hitsMsg.description = 'Showing Top '+countLimit+'\n'
    for(let i in hits){
      count += hits[i].enemy || 0
      if(i == 0) countPad = +hits[i].enemy.toString().length
      if(i < countLimit){
        let player = players.find(x=>x._id == hits[i]._id)
        hitsMsg.description += '`'+hits[i].enemy.toString().padStart(countPad, ' ')+'`'+' : '+(player ? player.name:hits[i]._id.split('-')[0])+'\n'
      }
    }
    hitsMsg.title += ' ('+count+')'
    msg2send.embeds.push(hitsMsg)
  }
  if((show == 'all' || show == 'skips') && stats.filter(x=>x.enemySkip > 0).length > 0){
    let skipsMsg = {
      color: 15844367,
      title: 'Shard Enemy Skips stats',
      description: ''
    }
    let count = 0, skips = sorter([{column: 'enemySkip', order: 'descending'}], stats.filter(x=>x.enemySkip > 0)), countPad = 3
    if(skips.length > countLimit)  skipsMsg.description = 'Showing Top '+countLimit+'\n'
    for(let i in skips){
      count += skips[i].enemySkip || 0
      if(i == 0) countPad = +skips[i].enemySkip.toString().length
      if(i < countLimit){
        let player = players.find(x=>x._id == skips[i]._id)
        skipsMsg.description += '`'+skips[i].enemySkip.toString().padStart(countPad, ' ')+'`'+' : '+(player ? player.name:skips[i]._id.split('-')[0])+'\n'
      }
    }
    skipsMsg.title += ' ('+count+')'
    msg2send.embeds.push(skipsMsg)
  }
  if((show == 'all' || show == 'early') && stats.filter(x=>x.early > 0).length > 0){
    let earlyMsg = {
      color: 15844367,
      title: 'Shard Early Hits stats',
      description: ''
    }
    let count = 0, early = sorter([{column: 'early', order: 'descending'}], stats.filter(x=>x.early > 0)), countPad = 3
    if(early.length > countLimit)  earlyMsg.description = 'Showing Top '+countLimit+'\n'
    for(let i in early){
      count += early[i].early || 0
      if(i == 0) countPad = +early[i].early.toString().length
      if(i < countLimit){
        let player = players.find(x=>x._id == early[i]._id)
        earlyMsg.description += '`'+early[i].early.toString().padStart(countPad, ' ')+'`'+' : '+(player ? player.name:early[i]._id.split('-')[0])+'\n'
      }
    }
    earlyMsg.title += ' ('+count+')'
    msg2send.embeds.push(earlyMsg)
  }
  if(msg2send.embeds.length > 0) msg2send.content = null
  return msg2send
}
