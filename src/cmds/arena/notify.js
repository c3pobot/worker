'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const { getDiscordAC } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'Error getting player info'}, pObj
  let notifyStatus = getOptValue(opt, 'status')
  let timeBeforePO = getOptValue(opt, 'hours')
  let poNotify = getOptValue(opt, 'po')
  let climbNotify = getOptValue(opt, 'climb')
  let notifyType = getOptValue(opt, 'type')
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(dObj?.allyCode) pObj = await swgohClient.post('getArenaPlayer', {allyCode: dObj.allyCode.toString()}, null)
  if(pObj){
    let tempNotify = {
      playerId: pObj.playerId,
      allyCode: pObj.allyCode,
      type: 0,
      notify:{
        status: 1,
        poNotify: 0,
        timeBeforePO: 24,
        method: 'dm',
        climb: 0
      }
    }
    let nObj = (await mongo.find('arena', {_id: pObj.playerId}, {_id:0, TTL:0}))[0]
    if(nObj) tempNotify = nObj
    tempNotify.dId = obj.member.user.id
    if(pObj.name) tempNotify.name = pObj.name
    if(notifyStatus >= 0){
      tempNotify.notify.status = +notifyStatus
    }else{
      if(notifyStatus){
        tempNotify.notify.status = 1
        tempNotify.notify.method = notifyStatus
      }
    }
    if(timeBeforePO > 0) tempNotify.notify.timeBeforePO = timeBeforePO
    if(poNotify >= 0) tempNotify.notify.poNotify = poNotify
    if(climbNotify >= 0) tempNotify.notify.climb = climbNotify
    if(notifyType >= 0) tempNotify.type = notifyType
    await mongo.set('arena', {_id: pObj.playerId}, tempNotify)
    let embedMsg = {
      color: 15844367,
      title: (tempNotify.name ? tempNotify.name+' ':'')+'Arena Notification Info',
      description: '```\n'
    }
    embedMsg.description += 'allyCode       : '+tempNotify.allyCode+'\n'
    embedMsg.description += 'Notifications  : '+(tempNotify.notify.status ? 'enabled':'disabled')+'\n'
    embedMsg.description += 'PO Notify      : '+(tempNotify.notify.poNotify ? 'enabled':'disabled')+'\n'
    embedMsg.description += 'Climb Notify   : '+(tempNotify.notify.climb ? 'enabled':'disabled')+'\n'
    embedMsg.description += 'Method         : '+tempNotify.notify.method+'\n'
    embedMsg.description += 'Time before PO : '+tempNotify.notify.timeBeforePO+'\n'
    embedMsg.description += 'Type           : '+(tempNotify.type > 0 ? (tempNotify.type === 1 ? 'Char':'Ship'):'Both')+'\n'
    embedMsg.description += '```'
    msg2send.content = null
    msg2send.embeds = [embedMsg]
  }
  return msg2send
}
