'use strict'
const mongo = require('mongoclient')
const showRules = require('./status')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let option = opt.option?.value || 'add', ruleStatus = opt.status?.value, ruleNotify = opt.notify?.value, ruleRole = opt.role?.value, ruleEmoji = opt.emoji?.value
  let ruleChId = opt.channel?.value, ruleTop = opt['top-rank']?.value, ruleBottom = opt['bottom-rank']?.value
  if(!shard.rules) shard.rules = {
    enemy: [':rage:'],
    friend: []
  }
  if(!shard.rules.enemySkips) shard.rules.enemySkips = {
    chId: shard.logChannel,
    status: 1,
    notify: 'disabled'
  }
  if(ruleStatus >= 0) shard.rules.enemySkips.status = ruleStatus
  if(ruleNotify) shard.rules.enemySkips.notify = ruleNotify
  if(opt.find(x=>x.name == 'closer')) shard.rules.enemySkips.closer = opt.find(x=>x.name == 'closer').value
  if(option == 'add'){
    if(ruleRole) shard.rules.enemySkips.roleId = ruleRole
    if(ruleEmoji && shard.rules.enemy.filter(x=>x === ruleEmoji).length == 0) shard.rules.enemy.push(ruleEmoji)
    if(ruleChId) shard.rules.enemySkips.chId = ruleChId
    if(ruleTop >= 0) shard.rules['top-rank'] = ruleTop
    if(ruleBottom >= 0) shard.rules['bottom-rank'] = ruleBottom
  }else{
    if(ruleEmoji) shard.rules.enemySkips.roleId = null
    if(ruleEmoji) shard.rules.enemy = shard.rules.enemy.filter(x=>x !== ruleEmoji)
    if(ruleChId) shard.rules.enemySkips.chId = shard.logChannel
    if(ruleTop >= 0) shard.rules['top-rank'] = 2
    if(ruleBottom >= 0) shard.rules['bottom-rank'] = null
  }
  await mongo.set('payoutServers', {_id: shard._id}, {rules: shard.rules})
  return await showRules(obj, shard, opt)
}
