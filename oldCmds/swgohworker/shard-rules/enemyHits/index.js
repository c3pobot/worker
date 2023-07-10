'use strict'
const ShowRules = require('src/cmds/shard-rules/status')
module.exports = async(obj, shard, opt = [])=>{
  try{
    let option = 'add'
    if(opt.find(x=>x.name == 'option')) option = opt.find(x=>x.name == 'option').value
    if(!shard.rules) shard.rules = {
      enemy: [':rage:'],
      friend: []
    }
    if(!shard.rules.enemyHits) shard.rules.enemyHits = {
      chId: shard.logChannel,
      status: 1,
      notify: 'disabled'
    }
    if(opt.find(x=>x.name == 'status')) shard.rules.enemyHits.status = opt.find(x=>x.name == 'status').value
    if(opt.find(x=>x.name == 'notify')) shard.rules.enemyHits.notify = opt.find(x=>x.name == 'notify').value
    if(option == 'add'){
      if(opt.find(x=>x.name == 'role')) shard.rules.enemyHits.roleId = opt.find(x=>x.name == 'role').value
      if(opt.find(x=>x.name == 'emoji') && shard.rules.enemy.filter(x=>x == opt.find(x=>x.name == 'emoji').value).length == 0) shard.rules.enemy.push(opt.find(x=>x.name == 'emoji').value)
      if(opt.find(x=>x.name == 'channel')) shard.rules.enemyHits.chId = opt.find(x=>x.name == 'channel').value
    }else{
      if(opt.find(x=>x.name == 'role')) shard.rules.enemyHits.roleId = null
      if(opt.find(x=>x.name == 'emoji')) shard.rules.enemy = shard.rules.enemy.filter(x=>x != opt.find(x=>x.name == 'emoji').value)
      if(opt.find(x=>x.name == 'channel')) shard.rules.enemyHits.chId = shard.logChannel
    }
    await mongo.set('payoutServers', {_id: shard._id}, {rules: shard.rules})
    ShowRules(obj, shard, opt)
  }catch(e){
    console.error(e)
  }
}
