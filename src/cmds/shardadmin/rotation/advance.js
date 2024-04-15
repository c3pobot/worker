'use strict'
const mongo = require('mongoclient')
const { getOptValue, showRotationSchedule } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  msg2send = {content: 'Rotation schedule not found'}
  let schedule = getOptValue(opt, 'schedule')?.toUpperCase()
  if(!schedule) return { content: 'you did not provide a rotation schedule name'}
  let rots = (await mongo.find('shardRotations', {_id: shard._id}))[0]
  if(!rots || !rots[schedule]) return msg2send
  msg2send.content = 'There needs to be at least 2 players to advance the schedule'
  if(rots[schedule]?.players?.length > 1){
    let tempPlayer = rots[schedule].players.shift()
    rots[schedule].players.push(tempPlayer)
    await mongo.set('shardRotations', {_id: shard._id}, {[schedule]: rots[schedule]})
    msg2send.content = await showRotationSchedule(obj, rots[schedule], shard, true)
    if(!rots[schedule].poOffSet && rots[schedule].poOffSet != 0) msg2send.content += '**Note: There is no poOffSet for the rotation schedule.\nYou need to provide an allyCode or mention a user that has allyCode linked to discordId**'
  }
  return msg2send
}
