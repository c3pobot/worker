'use strict'
const mongo = require('mongoclient')
const { getGAInfo } = require('src/cmds/ga/helpers')
const showSettings = require('./show')
const { getDiscordAC, replyButton, getOptValue, findUnit } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You did not specify a unit'}, unit, uInfo, sendResponse = 1, guildId, gaInfo
  if(opt.find(x=>x.name == 'unit')) unit = opt.find(x=>x.name == 'unit').value.toString().toLowerCase().trim()
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(dObj?.allyCode){
    gaInfo = await GetGAInfo(dObj.allyCode)
    if(!gaInfo) gaInfo = {units: [], enemies: []}
    msg2send.content = 'you did not specify a unit'
    unit = getOptValue(opt, 'unit')
  }
  if(unit){
    if(unit) unit = unit.toString().trim()
    msg2send.content = 'error finding unit **'+unit+'**'
    uInfo = await findUnit(obj, unit)
    if(uInfo === 'GETTING_CONFIRMATION') return
  }
  if(uInfo){
    await replyButton(obj, 'Removing **'+uInfo.nameKey+'**...')
    gaInfo.units = gaInfo.units.filter(x=>x.baseId != uInfo.baseId)
    await mongo.pull('ga', {_id: dObj.allyCode.toString()}, {units: {baseId: uInfo.baseId}})
    msg2send = await showSettings(obj, opt, dObj, gaInfo)
  }
  return msg2send
}
