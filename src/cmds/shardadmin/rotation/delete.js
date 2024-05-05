'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let schedule = opt.schedule?.value?.toString()?.trim()?.toUpperCase()
  if(!schedule) return { content: 'you did not provide a rotation schedule name' }

  let rots = (await mongo.find('shardRotations', { _id: shard._id }))[0]
  if(!rots || !rots[schedule]) return { content: `${schedule} is not a rotation schedule` }

  await mongo.set('shardRotations', { _id: shard._id }, { [schedule]: null })
  return { content: '**'+schedule+'** rotation was deleted' }
}
