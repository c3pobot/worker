'use strict'
const mongo = require('mongoclient')
const { getOptValue, getDiscordAC } = require('src/helpers')
const swgohClient = require('src/swgohClient')
const { showRotationSchedule } = require('src/helpers')
module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let msg2send = {content: 'You did not provide the correct information'}, pObj, allyCode, dId
    let schedule = opt?.schedule?.value?.toString()?.toUpperCase()
  if(!schedule) return { content: 'you did not provide a rotation schedule name'}
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
  tempRot.chId = opt?.channel?.value || tempRot.chId
  tempRot.startTime = opt?.hours?.value || tempRot.startTime
  tempRot.notify = opt?.notify?.value || tempRot.notify
  tempRot.order = opt?.order?.value || tempRot.order

  let role = opt.role?.value

  if(role){
    if(role.startsWith('<@&')){
      tempRot.roleId = opt.role?.value?.replace(/[<@&>]/g, '')
    }else{
      delete tempRot.roleId
    }
  }

  let poTime = opt?.potime?.value
  if(poTime?.startsWith('<@')){
    dId = poTime.replace(/[<@!>]/g, '')
  }else{
    allyCode = poTime?.toString()?.replace(/-/g, '')
  }
  if(dId){
    let dObj = (await mongo.find('shardPlayerCache', {dId: dId, shardId: shard._id}))[0]
    if(!dObj?.allyCode) dObj = await getDiscordAC(dId)
    allyCode = dObj?.allyCode?.toString()
  }
  if(allyCode){
    let pObj = await swgohClient.post('getArenaPlayer', {allyCode: allyCode.toString()}, null)
    if(pObj && pObj.poOffSet != null) tempRot.poOffSet = pObj.poOffSet
  }
  await mongo.set('shardRotations', {_id: shard._id}, {[schedule]: tempRot})
  msg2send.content = await showRotationSchedule(obj, tempRot, shard, true)
  if(!tempRot.poOffSet) msg2send.content += '**Note: There is no poOffSet for the rotation schedule.\nYou need to provide an allyCode or mention a user that has allyCode linked to discordId**'
  return msg2send
}
