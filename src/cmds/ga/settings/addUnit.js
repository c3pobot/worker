'use strict'
const mongo = require('mongoclient')
const { getGAInfo } = require('src/cmds/ga/helpers')
const showSettings = require('./show')
const { getDiscordAC, replyButton, getOptValue } = require('src/helpers')

module.exports = async(obj, opt = [])=>{
  let msg2send = {content: 'Your allyCode is not linked to your discord id'}, unit, uInfo, sendResponse = 1, gaInfo
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(dObj?.allyCode){
    gaInfo = await getGAInfo(dObj.allyCode)
    if(!gaInfo) gaInfo = {units: [], enemies: []}
    msg2send.content = 'you did not specify a unit'
    unit = getOptValue(opt, 'unit')
  }
  if(unit){
    unit = unit.toString().trim()
    msg2send.content = 'error finding unit **'+unit+'**'
    uInfo = await findUnit(obj, unit, null)
    if(uInfo === 'GETTING_CONFIRMATION') return
  }
  if(uInfo){
    await replyButton(obj, 'Adding **'+uInfo.nameKey+'**...')
    if(gaInfo.units.filter(x=>x.baseId == uInfo.baseId).length == 0){
      gaInfo.units.push({
        baseId: uInfo.baseId,
        nameKey: uInfo.nameKey,
        combatType: uInfo.combatType
      })
      await mongo.push('ga', {_id: dObj.allyCode.toString()}, {units: {
        baseId: uInfo.baseId,
        nameKey: uInfo.nameKey,
        combatType: uInfo.combatType
      }})
      msg2send = await showSettings(obj, opt, dObj, gaInfo)
    }
  }
  return msg2send
}
