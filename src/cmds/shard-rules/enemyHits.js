'use strict'
const mongo = require('mongoclient')
const showRules = require('./status')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let option = opt?.option?.value || 'add', ruleStatus = opt.status?.value, ruleRole = opt.role?.value
  let ruleNotify = opt.notify?.value, ruleEmoji = opt.emoji?.value, ruleChId = opt?.channel?.value
  if(!shard.rules) shard.rules = {
    enemy: [':rage:'],
    friend: []
  }
  if(!shard.rules.enemyHits) shard.rules.enemyHits = {
    chId: shard.logChannel,
    status: 1,
    notify: 'disabled'
  }

  if(ruleStatus >= 0) shard.rules.enemyHits.status = ruleStatus
  if(ruleNotify) shard.rules.enemyHits.notify = ruleNotify
  if(option == 'add'){
    if(ruleRole) shard.rules.enemyHits.roleId = ruleRole
    if(ruleEmoji && shard.rules.enemy.filter(x=>x === ruleEmoji).length == 0) shard.rules.enemy.push(ruleEmoji)
    if(ruleChId) shard.rules.enemyHits.chId = ruleChId
  }else{
    if(ruleRole) shard.rules.enemyHits.roleId = null
    if(ruleEmoji) shard.rules.enemy = shard.rules.enemy.filter(x=>x !== ruleEmoji)
    if(ruleChId) shard.rules.enemyHits.chId = shard.logChannel
  }
  await mongo.set('payoutServers', { _id: shard._id }, { rules: shard.rules })
  return await showRules(obj, shard, opt)
}
