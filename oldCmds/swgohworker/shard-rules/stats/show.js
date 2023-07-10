'use strict'
const countLimit = +process.env.SHARD_STAT_COUNT_LIMIT || 100
module.exports = async(obj, shard, opt = [])=>{
  try{
    let msg2send = {content: 'There are no stats available'}, show = 'all'
    if(opt.find(x=>x.name == 'stat')) show = opt.find(x=>x.name == 'stat').value
    const stats = await mongo.find('shardHitList', {shardId: shard._id})
    if(stats && stats.length > 0){
      const players = await mongo.find('shardPlayers', {shardId: shard._id})
      msg2send.embeds = []
      if((show == 'all' || show == 'hits') && stats.filter(x=>x.enemy > 0).length > 0){
        let count = 0, hits = await sorter([{column: 'enemy', order: 'descending'}], stats.filter(x=>x.enemy > 0)), countPad = 3
        const hitsMsg = {
          color: 15844367,
          title: 'Shard Enemy Hits stats',
          description: ''
        }
        if(hits.length > countLimit)  hitsMsg.description = 'Showing Top '+countLimit+'\n'
        for(let i in hits){
          count += hits[i].enemy || 0
          if(i == 0) countPad = +hits[i].enemy.toString().length
          if(i < countLimit){
            const player = players.find(x=>x._id == hits[i]._id)
            hitsMsg.description += '`'+hits[i].enemy.toString().padStart(countPad, ' ')+'`'+' : '+(player ? player.name:hits[i]._id.split('-')[0])+'\n'
          }
        }
        hitsMsg.title += ' ('+count+')'
        msg2send.embeds.push(hitsMsg)
      }
      if((show == 'all' || show == 'skips') && stats.filter(x=>x.enemySkip > 0).length > 0){
        const skipsMsg = {
          color: 15844367,
          title: 'Shard Enemy Skips stats',
          description: ''
        }
        let count = 0, skips = await sorter([{column: 'enemySkip', order: 'descending'}], stats.filter(x=>x.enemySkip > 0)), countPad = 3
        if(skips.length > countLimit)  skipsMsg.description = 'Showing Top '+countLimit+'\n'
        for(let i in skips){
          count += skips[i].enemySkip || 0
          if(i == 0) countPad = +skips[i].enemySkip.toString().length
          if(i < countLimit){
            const player = players.find(x=>x._id == skips[i]._id)
            skipsMsg.description += '`'+skips[i].enemySkip.toString().padStart(countPad, ' ')+'`'+' : '+(player ? player.name:skips[i]._id.split('-')[0])+'\n'
          }
        }
        skipsMsg.title += ' ('+count+')'
        msg2send.embeds.push(skipsMsg)
      }
      if((show == 'all' || show == 'early') && stats.filter(x=>x.early > 0).length > 0){
        const earlyMsg = {
          color: 15844367,
          title: 'Shard Early Hits stats',
          description: ''
        }
        let count = 0, early = await sorter([{column: 'early', order: 'descending'}], stats.filter(x=>x.early > 0)), countPad = 3
        if(early.length > countLimit)  earlyMsg.description = 'Showing Top '+countLimit+'\n'
        for(let i in early){
          count += early[i].early || 0
          if(i == 0) countPad = +early[i].early.toString().length
          if(i < countLimit){
            const player = players.find(x=>x._id == early[i]._id)
            earlyMsg.description += '`'+early[i].early.toString().padStart(countPad, ' ')+'`'+' : '+(player ? player.name:early[i]._id.split('-')[0])+'\n'
          }
        }
        earlyMsg.title += ' ('+count+')'
        msg2send.embeds.push(earlyMsg)
      }
      if(msg2send.embeds.length > 0) msg2send.content = null
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(e)
  }
}
