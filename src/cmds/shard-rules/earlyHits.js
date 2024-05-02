'use strict'
const mongo = require('mongoclient')
const showRules = require('./status')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let option = opt.option?.value || 'add', ruleStatus = opt.status?.value, ruleNotify = opt.notify?.value, ruleRole = opt.role?.value, ruleEmoji = opt.emoji?.value
  let ruleChId = opt.channel?.value, ruleTop = opt['top-rank']?.value, ruleBottom = opt['bottom-rank']?.value, ruleCloser = opt.closer?.value, ruleHour = opt.hour?.value
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
  if(ruleStatus >= 0) shard.rules.earlyHits.status = ruleStatus
  if(ruleNotify) shard.rules.earlyHits.notify = ruleNotify
  if(opt.find(x=>x.name == 'closer')) shard.rules.earlyHits.closer = opt.find(x=>x.name == 'closer').value
  if(option === 'add'){
    if(ruleRole) shard.rules.earlyHits.roleId = ruleRole
    if(ruleEmoji && shard.rules.enemy.filter(x=>x == ruleEmoji).length == 0) shard.rules.enemy.push(ruleEmoji)
    if(ruleChId) shard.rules.earlyHits.chId = ruleChId
    if(ruleHour >= 0) shard.rules.earlyHits.hour = ruleHour
    if(ruleTop >= 0) shard.rules['top-rank'] = ruleTop
    if(ruleBottom >=0 ) shard.rules['bottom-rank'] = ruleBottom
  }else{
    if(ruleRole) shard.rules.earlyHits.roleId = null
    if(ruleEmoji) shard.rules.enemy = shard.rules.enemy.filter(x=>x != opt.find(x=>x.name === 'emoji').value)
    if(ruleChId) shard.rules.earlyHits.chId = shard.logChannel
    if(ruleHour >= 0) shard.rules.earlyHits.hour = 2
    if(ruleTop >= 0) shard.rules['top-rank'] = 2
    if(ruleBottom >=0 ) shard.rules['bottom-rank'] = null
  }
  await mongo.set('payoutServers', { _id: shard._id }, { rules: shard.rules })
  return await showRules(obj, shard, opt)
}
