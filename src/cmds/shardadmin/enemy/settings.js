'use strict'
const mongo = require('mongoclient')
const showEnemyWatch = require('./show')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let role = getOptValue(opt, 'role')
  let rank = getOptValue(opt, 'rank')
  let chId = getOptValue(opt, 'channel')
  let trigger = getOptValue(opt, 'trigger')
  let notifyStatus = getOptValue(opt, 'status')
  let tempEnemy = {
    emoji: [],
    allyCodes: [],
    startRank: 50,
    status: 'once',
    notify: 1,
    chId: shard.logChannel
  }
  if(shard.enemyWatch) tempEnemy = shard.enemyWatch
  tempEnemy.roleId = role
  if(rank > 0) tempEnemy.startRank = rank
  if(chId) tempEnemy.chId = chId
  if(trigger) tempEnemy.status = trigger
  if(notifyStatus >= 0) tempEnemy.notify = notifyStatus
  await mongo.set('payoutServers', {_id: shard._id}, {enemyWatch: tempEnemy})
  shard.enemyWatch = tempEnemy
  return await showEnemyWatch(obj, shard, opt)
}
