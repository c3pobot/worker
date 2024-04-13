'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const getGuildId = require('../getGuildId')
const getOptValue = require('../getOptValue')
const replyButton = require('../replyButton')
const replyMsg = require('../replyMsg')
const replyError = require('../replyError')
const findUnit = require('../findUnit')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You allyCode is not linked to your discordId or you are not part of a guild'}, unit, uInfo, guildId
    let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
    if(pObj && pObj.guildId){
      msg2send.content = 'You must provide a unit'
      guildId = pObj.guildId
      unit = getOptValue(opt, 'unit')
      if(unit) unit = unit.toString().trim()
    }
    if(unit){
      msg2send.content = 'Error finding unit **'+unit+'**'
      uInfo = await findUnit(obj, unit, guildId)
      if(uInfo === 'GETTING_CONFIRMATION') return
    }
    if(uInfo){
      await replyButton(obj, 'Getting guild info for...')
      let gObj = (await mongo.find('guilds', {_id: guildId}))[0]
      if(!gObj){
        gObj = {
          guildName: pObj.guildName,
          sync: 0
        }
        await mongo.set('guilds', {_id: guildId}, gObj)
      }
      if(!gObj.units) gObj.units = []
      if(gObj.units.filter(x=>x.baseId == uInfo.baseId).length == 0) await mongo.push('guilds', {_id: guildId}, {units: {
        baseId: uInfo.baseId,
        nameKey: uInfo.nameKey,
        combatType: uInfo.combatType
      }})
      msg2send.content = '**'+uInfo.nameKey+'** was added as a unit for guild/tw report'
    }
    await replyMsg(obj, msg2send)
  }catch(e){
    log.error(e)
    replyError(obj)
  }
}
