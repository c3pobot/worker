'use strict'
const ShowEnemyWatch = require('./show')
module.exports = async(obj, shard, opt)=>{
  try{
    let allyCode, emoji
    let tempEnemy = {
      emoji: [],
      allyCodes: [],
      startRank: 50,
      status: 'once',
      notify: 1,
      chId: shard.logChannel
    }
    if(shard.enemyWatch) tempEnemy = shard.enemyWatch
    if(opt && opt.find(x=>x.name == 'allycode')) allyCode = opt.find(x=>x.name == 'allycode').value.replace(/-/g, '')
    if(opt && opt.find(x=>x.name == 'emoji')) emoji = opt.find(x=>x.name == 'emoji').value
    if(allyCode){
      const pObj = (await mongo.find('shardPlayers', {_id: allyCode+'-'+shard._id}))[0]
      if(pObj && pObj.allyCode && tempEnemy.allyCodes.filter(x=>x == +allyCode).length == 0) tempEnemy.allyCodes.push(+allyCode)
    }
    if(emoji && tempEnemy.emoji.filter(x=>x == emoji).length == 0) tempEnemy.emoji.push(emoji)
    await mongo.set('payoutServers', {_id: shard._id}, {enemyWatch: tempEnemy})
    const tempShard = (await mongo.find('payoutServers', {_id: shard._id}))[0]
    ShowEnemyWatch(obj, tempShard, opt)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
