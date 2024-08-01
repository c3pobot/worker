'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = {}, pObj = {})=>{
  let allyCode = +(opt.allycode?.value?.toString()?.replace(/-/g, '')?.trim() || 0)
  if(!allyCode) return { content: 'You did not provide an allyCode' }

  let player = await swgohClient.post('playerArena', { allyCode: allyCode?.toString() })
  if(!player?.allyCode) return { content: `**${allyCode}** is not valid` }

  let waitList = (await mongo.find('guildWaitList', { _id: pObj.guildId}, { _id: 0 }))[0]
  if(!waitList) waitList = { id: pObj.guildId, name: pObj.guildName, players: [] }

  let oldPlayer = waitList.players.find(x=>x.allyCode === allyCode)
  if(oldPlayer?.allyCode) return { content: `${oldPlayer.allyCode} for ${oldPlayer.name} is already on the guild waitlist` }

  waitList.players.push({ allyCode: +allyCode, name: player.name })
  await mongo.set('guildWaitList', { _id: pObj.guildId }, waitList )
  return { content: `${player.name} was added to ${waitList.name} guild waitlist` }
}
