'use strict'
module.exports = async(obj, shard, opt = [])=>{
  try{
    let remove = 'all'
    if(opt.find(x=>x.name == 'stat')) remove = opt.find(x=>x.name == 'stat').value
    let msg2send = {content: remove+' stats have been cleared'}
    if(remove == 'all'){
      await mongo.delMany('shardHitList', {shardId: shard._id})
    }else{
      if(remove == 'skips') await mongo.setMany('shardHitList', {shardId: shard._id}, {enemySkip: 0})
      if(remove == 'hits') await mongo.setMany('shardHitList', {shardId: shard._id}, {enemy: 0})
      if(remove == 'early') await mongo.setMany('shardHitList', {shardId: shard._id}, {early: 0})
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(e)
  }
}
