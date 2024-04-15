'use strict'
const mongo = require('mongoclient')
const { getOptValue, getDiscordAC } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: 'You did not provide the correct information'}, pObj, allyCode, dId
  let schedule = getOptValue(opt, 'schedule')?.toUpperCase()  
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
  tempRot.chId = getOptValue(opt, 'channel', tempRot.chId)
  tempRot.startTime = getOptValue(opt, 'hours', tempRot.startTime)
  tempRot.notify = getOptValue(opt, 'notify', tempRot.notify)
  tempRot.order = getOptValue(opt, 'order', tempRot.order)
  let role = getOptValue(opt, 'role')
  if(role){
    if(role.startsWith('<@&')){
      tempRot.roleId = opt.find(x=>x.name == 'role').value.replace(/[<@&>]/g, '')
    }else{
      delete tempRot.roleId
    }
  }
  let poTime = getOptValue(opt, 'potime')
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
  if(tempRot.poOffSet != null) msg2send.content += '**Note: There is no poOffSet for the rotation schedule.\nYou need to provide an allyCode or mention a user that has allyCode linked to discordId**'
  return msg2send
}
