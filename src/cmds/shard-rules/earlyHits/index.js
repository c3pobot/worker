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
    if(!shard.rules.earlyHits) shard.rules.earlyHits = {
      chId: shard.logChannel,
      status: 1,
      notify: 'disabled',
      closer: false,
      hour: 2
    }
    if(opt.find(x=>x.name == 'status')) shard.rules.earlyHits.status = opt.find(x=>x.name == 'status').value
    if(opt.find(x=>x.name == 'notify')) shard.rules.earlyHits.notify = opt.find(x=>x.name == 'notify').value
    if(opt.find(x=>x.name == 'closer')) shard.rules.earlyHits.closer = opt.find(x=>x.name == 'closer').value
    if(option == 'add'){
      if(opt.find(x=>x.name == 'role')) shard.rules.earlyHits.roleId = opt.find(x=>x.name == 'role').value
      if(opt.find(x=>x.name == 'emoji') && shard.rules.enemy.filter(x=>x == opt.find(x=>x.name == 'emoji').value).length == 0) shard.rules.enemy.push(opt.find(x=>x.name == 'emoji').value)
      if(opt.find(x=>x.name == 'channel')) shard.rules.earlyHits.chId = opt.find(x=>x.name == 'channel').value
      if(opt.find(x=>x.name == 'hour')) shard.rules.earlyHits.hour = opt.find(x=>x.name == 'hour').value
      if(opt.find(x=>x.name == 'top-rank')) shard.rules['top-rank'] = opt.find(x=>x.name == 'top-rank').value
      if(opt.find(x=>x.name == 'bottom-rank')) shard.rules['bottom-rank'] = opt.find(x=>x.name == 'bottom-rank').value
    }else{
      if(opt.find(x=>x.name == 'role')) shard.rules.earlyHits.roleId = null
      if(opt.find(x=>x.name == 'emoji')) shard.rules.enemy = shard.rules.enemy.filter(x=>x != opt.find(x=>x.name == 'emoji').value)
      if(opt.find(x=>x.name == 'channel')) shard.rules.earlyHits.chId = shard.logChannel
      if(opt.find(x=>x.name == 'hour')) shard.rules.earlyHits.hour = 2
      if(opt.find(x=>x.name == 'top-rank')) shard.rules['top-rank'] = 2
      if(opt.find(x=>x.name == 'bottom-rank')) shard.rules['bottom-rank'] = null
    }
    await mongo.set('payoutServers', {_id: shard._id}, {rules: shard.rules})
    await ShowRules(obj, shard, opt)
  }catch(e){
    console.error(e)
  }
}
