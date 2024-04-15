'use strict'
const mongo = require('mongoclient')
const { getPlayers } = require('./helper')
const { getOptValue, showRotationSchedule } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let chId, roleId, msg2send = {content: 'You did not provide the correct information'}
  let schedule = getOptValue(opt, 'schedule')?.toUpperCase()
  let players = getOptValue(opt, 'players')?.split(',') || []
  if(!schedule) return { content: 'you did not provide a rotation schedule'}
  let tempRot = {
    id: schedule,
    chId: obj.channel_id,
    sId: shard.sId,
    shardId: shard._id,
    type: shard.type,
    startTime: 2,
    order: 'normal',
    notify: 'off',
    notifyStart: 0,
    players: []
  }
  let rots = (await mongo.find('shardRotations', {_id: shard._id}))[0]
  if(rots && rots[schedule]) tempRot = rots[schedule]
  if(players?.length > 0){
    let pArray = await getPlayers(shard, players)
    if(pArray && pArray.players.length > 0){
      for(let i in pArray.players){
        if(tempRot.players.filter(x=>x.name == pArray.players[i].name).length == 0) tempRot.players.push(pArray.players[i])
      }
    }
    if(pArray && (pArray.poOffSet || pArray.poOffSet == 0)) tempRot.poOffSet = pArray.poOffSet
  }
  await mongo.set('shardRotations', {_id: shard._id}, {[schedule]: tempRot})
  msg2send.content = await showRotationSchedule(obj, tempRot, shard, true)
  if(!tempRot.poOffSet && tempRot.poOffSet != 0) msg2send.content += '**Note: There is no poOffSet for the rotation schedule.\nYou need to provide an allyCode or mention a user that has allyCode linked to discordId**'
  return msg2send
}
