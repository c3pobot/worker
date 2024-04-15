'use strict'
const mongo = require('mongoclient')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: 'That was not a valid rotation schedule'}
  let schedule = getOptValue(opt, 'schedule')?.toUpperCase()
  if(!schedule) return { content: 'you did not provide a rotation schedule name'}
  let rots = (await mongo.find('shardRotations', {_id: shard._id}))[0]
  if(!rots || !rots[schedule]) return msg2send
  await mongo.unset('shardRotations', {_id: shard._id}, {[schedule]: rots[schedule]})
  msg2send.content = '**'+schedule+'** rotation was deleted'
  return msg2send
}
