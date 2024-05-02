'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const { getDiscordAC } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let notifyStatus = opt.status?.value, timeBeforePO = opt.hours?.value, poNotify = opt.po?.value, climbNotify = opt.climb?.value, notifyType = opt.type?.value

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj) return { content: 'you do not have your allyCode linked to your discord id...' }
  let pObj = await swgohClient.post('getArenaPlayer', {allyCode: dObj.allyCode.toString()}, null)
  if(!pObj?.allyCode) return { content: 'error getting player data' }

  let tempNotify = { playerId: pObj.playerId, allyCode: +pObj.allyCode, type: 0, notify: { status: 1, poNotify: 0, timeBeforePO: 24, method: 'dm', climb: 0 } }

  let player = (await mongo.find('arena', {_id: pObj.playerId}, { _id: 0, TTL: 0 }))[0]
  if(player) tempNotify = player
  tempNotify.dId = obj.member?.user?.id
  tempNotify.name = pObj.name
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
  await mongo.set('arena', {_id: pObj.playerId}, tempNotify)
  return { content: null, embeds: [embedMsg] }
}
