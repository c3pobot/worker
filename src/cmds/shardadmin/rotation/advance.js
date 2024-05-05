'use strict'
const mongo = require('mongoclient')
const { showRotationSchedule } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let schedule = opt.schedule?.value?.toString()?.trim()?.toUpperCase()
  if(!schedule) return { content: 'you did not provide a rotation schedule name'}

  let rots = (await mongo.find('shardRotations', {_id: shard._id}))[0]
  if(!rots || !rots[schedule]) return { content: `${schedule} is not a rotation schedule` }

  if(!rots[schedule].players || rots[schedule].players?.length < 2) return { content: 'There needs to be at least 2 players to advance the schedule' }

  let tempPlayer = rots[schedule].players.shift()
  rots[schedule].players.push(tempPlayer)
  await mongo.set('shardRotations', {_id: shard._id}, {[schedule]: rots[schedule]})
  let content = await showRotationSchedule(obj, rots[schedule], shard, true)
  if(!rots[schedule].poOffSet && rots[schedule].poOffSet != 0) content += '**Note: There is no poOffSet for the rotation schedule.\nYou need to provide an allyCode or mention a user that has allyCode linked to discordId**'
  return { content: content }
}
