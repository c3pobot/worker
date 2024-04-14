'use strict'
const mongo = require('mongoclient')
const showRules = require('./status')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let option = getOptValue(opt, 'option', 'add')
  let ruleStatus = getOptValue(opt, 'status')
  let ruleNotify = getOptValue(opt, 'notify')
  let ruleCloser = getOptValue(opt, 'closer')
  let ruleRole = getOptValue(opt, 'role')
  let ruleEmoji = getOptValue(opt, 'emoji')
  let ruleChId = getOptValue(opt, 'channel')
  let ruleHour = getOptValue(opt, 'hour')
  let ruleTop = getOptValue(opt, 'top-rank')
  let ruleBottom = getOptValue(opt, 'bottom-rank')
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
  await mongo.set('payoutServers', {_id: shard._id}, {rules: shard.rules})
  return await showRules(obj, shard, opt)
}
