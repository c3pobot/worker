'use strict'
const { showNotifyStatus } = require('./helper')
const { getDiscordAC, getOptValue } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: 'Your allyCode is not linked to your discord id or your allyCode has not been added to the shard'}
  let notifyStatus = getOptValue(opt, 'status')
  let timeBeforePO = getOptValue(opt, 'hours')
  let poNotify = getOptValue(opt, 'po')
  let altNotify = getOptValue(opt, 'alt')
  let pObj = (await mongo.find('shardPlayers', {dId: obj.member.user.id, shardId: shard._id}))[0]
  if(!pObj){
    let dObj = await getDiscordAC(obj.member.user.id)
    if(dObj?.allyCode) pObj = (await mongo.find('shardPlayers', {_id: dObj.allyCode+'-'+shard._id}))[0]
  }
  if(pObj){
    msg2send.content = 'Error setting notify status'
    let tempNotify = {
      status: 0,
      method: 'log',
      startTime: 24,
      poMsg: 0,
      altStatus: 0
    }
    if(pObj?.notify) tempNotify = pObj.notify
    if(notifyStatus >= 0){
      tempNotify.status = +notifyStatus
    }else{
      if(notifyStatus){
        tempNotify.status = 1
        tempNotify.method = notifyStatus
      }
    }
    if(timeBeforePO > 0) tempNotify.startTime = timeBeforePO
    if(poNotify >= 0) tempNotify.poMsg = poNotify
    if(altNotify >= 0) tempNotify.altStatus = altNotify
    await mongo.set('shardPlayers', {_id: pObj._id}, {notify: tempNotify})
    let embedMsg = await showNotifyStatus(shard, pObj._id)
    if(embedMsg){
      msg2send.content = null
      msg2send.embeds = [embedMsg]
    }
  }
  return msg2send
}
