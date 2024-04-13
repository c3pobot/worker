'use strict'
const ShowEnemyWatch = require('./show')
module.exports = async(obj, shard, opt)=>{
  try{
    let allyCode, emoji
    if(shard && shard.enemyWatch){
      if(opt && opt.find(x=>x.name == 'allycode')) allyCode = opt.find(x=>x.name == 'allycode').value.replace(/-/g, '')
      if(opt && opt.find(x=>x.name == 'emoji')) emoji = opt.find(x=>x.name == 'emoji').value
      if(allyCode) shard.enemyWatch.allyCodes = shard.enemyWatch.allyCodes.filter(x=>x != +allyCode)
      if(emoji) shard.enemyWatch.emoji = shard.enemyWatch.emoji.filter(x=>x != emoji)
      if(allyCode || emoji) await mongo.set('payoutServers', {_id: shard._id}, {enemyWatch: shard.enemyWatch})
    }
    const tempShard = (await mongo.find('payoutServers', {_id: shard._id}))[0]
    ShowEnemyWatch(obj, tempShard, opt)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
