'use strict'
const { mongo, GetAllyCodeFromDiscordId, GetOptValue, ReplyMsg } = require('helpers')
const swgohClient = require('swgohClient')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'Error getting player info'}, pObj

    let dObj = await GetAllyCodeFromDiscordId(obj.member.user.id, opt)
    if(dObj?.allyCode){
      msg2send.content = 'Error getting player info'
      pObj = await swgohClient('queryArenaPlayer', {allyCode: dObj.allyCode.toString()})
    }
    if(pObj?.playerId){
      let tempNotify = { playerId: pObj.playerId, allyCode: pObj.allyCode, type: 0, notify: { status: 1, poNotify: 0, timeBeforePO: 24, method: 'dm', climb: 0 } }
      let notifyObj = (await mongo.find('arena', {_id: pObj.playerId}, {_id:0, TTL:0}))[0]
      if(notifyObj) tempNotify = notifyObj
      let status = GetOptValue(opt, 'status')
      if(status === 'dm' || status === 'log'){
        tempNotify.notify.status = 1
        tempNotify.notify.method = status
      }else{
        tempNotify.notify.status = +status
      }
      tempNotify.notify.timeBeforePO = GetOptValue(opt, 'hours', tempObj.notify.timeBeforePO)
      tempNotify.notify.poNotify = GetOptValue(opt, 'po', tempObj.notify.poNotify)
      tempNotify.notify.climb = GetOptValue(opt, 'climb', tempObj.notify.climb)
      tempNotify.type = GetOptValue(opt, 'type', tempObj.type)
      tempNotify.dId = obj.member.user.id
      if(pObj.name) tempNotify.name = pObj.name
      await mongo.set('arena', {_id: pObj.playerId}, tempNotify)
      const embedMsg = {
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
    ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
