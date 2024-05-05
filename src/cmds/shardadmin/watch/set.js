'use strict'
const mongo = require('mongoclient')
const showWatch = require('./show')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let msg2send = {content: 'You did not provide the correct information' }
  let allyCode = opt.allycode?.value?.toString()?.trim()?.replace(/-/g, ''), roleId = opt.role?.value
  if(!allyCode || !roleId) return { content: 'You did not provide the correct information' }

  let tempWatch = {
    allyCode: +allyCode,
    chId: shard.logChannel,
    startTime: 24,
    moveDir: 'both'
  }
  if(!shard.watch) shard.watch = {}
  if(shard.watch && shard.watch[allyCode]) tempWatch = shard.watch[allyCode]
  tempWatch.roleId = roleId
  tempWatch.chId = opt.channel?.value || tempWatch.chId
  tempWatch.startTime = opt.hours?.value || tempWatch.startTime
  tempWatch.startRank = opt.rank?.value || tempWatch.startRank
  tempWatch.moveDir = opt.direction?.value || tempWatch.moveDir
  shard.watch[allyCode] = tempWatch
  await mongo.set('payoutServers', {_id: shard._id}, { watch: shard.watch })
  return await showWatch(obj, shard, opt)
}
