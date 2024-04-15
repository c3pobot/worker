'use strict'
const mongo = require('mongoclient')
const showWatch = require('./show')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: 'You did not provide the correct information'}
  let allyCode = getOptValue(opt, 'allycode')?.toString()?.replace(/-/g, '')
  let roleId = getOptValue(opt, 'role')
  if(!allyCode || !roleId) return msg2send
  let tempWatch = {
    allyCode: +allyCode,
    chId: shard.logChannel,
    startTime: 24,
    moveDir: 'both'
  }
  if(shard.watch && shard.watch[allyCode]) tempWatch = shard.watch[allyCode]
  tempWatch.roleId = roleId
  tempWatch.chId = getOptValue(opt, 'channel', tempWatch.chId)
  tempWatch.startTime = getOptValue(opt, 'hours', tempWatch.startTime)
  tempWatch.startRank = getOptValue(opt, 'rank', tempWatch.startRank)
  tempWatch.moveDir = getOptValue(opt, 'direction', tempWatch.moveDir)
  await mongo.set('payoutServers', {_id: shard._id}, {['watch.'+allyCode]: tempWatch})
  shard.watch[allyCode] = tempWatch
  msg2send.content = 'Role watch updated'
  msg2send = await showWatch(obj, shard, [{name: 'allycode', value: allyCode}])
  return msg2send
}
