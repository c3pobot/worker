'use strict'
const ShowEnemyWatch = require('./show')
module.exports = async(obj, shard, opt = [])=>{
  try{
    let tempEnemy = {
      emoji: [],
      allyCodes: [],
      startRank: 50,
      status: 'once',
      notify: 1,
      chId: shard.logChannel
    }
    if(shard.enemyWatch) tempEnemy = shard.enemyWatch
    if(opt){
      if(opt.find(x=>x.name == 'role')){
        tempEnemy.roleId = opt.find(x=>x.name == 'role').value
      }else{
        delete tempEnemy.roleId
      }
      if(opt.find(x=>x.name == 'rank') && opt.find(x=>x.name == 'rank').value > 0) tempEnemy.startRank = opt.find(x=>x.name == 'rank').value
      if(opt.find(x=>x.name == 'channel')) tempEnemy.chId = opt.find(x=>x.name == 'channel').value
      if(opt.find(x=>x.name == 'trigger')) tempEnemy.status = opt.find(x=>x.name == 'trigger').value
      if(opt.find(x=>x.name == 'status')) tempEnemy.notify = opt.find(x=>x.name == 'status').value
    }
    await mongo.set('payoutServers', {_id: shard._id}, {enemyWatch: tempEnemy})
    const tempShard = (await mongo.find('payoutServers', {_id: shard._id}))[0]
    ShowEnemyWatch(obj, tempShard, opt)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
