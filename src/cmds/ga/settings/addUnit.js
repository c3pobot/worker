'use strict'
const mongo = require('mongoclient')
const { getGAInfo } = require('src/cmds/ga/helpers')
const showSettings = require('./show')
const { getDiscordAC, replyButton, getOptValue, findUnit } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'Your allyCode is not linked to your discord id'}
  if(obj.confirm) await replyButton(obj)
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.allyCode) return msg2send

  let unit = getOptValue(opt, 'unit')?.toString()?.trim()
  if(!unit) return { content: 'you did not specify a unit' }

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(!uInfo?.baseId) return { content: `Error finding **${unit}**`}

  let gaInfo = await getGAInfo(dObj?.allyCode)
  if(gaInfo.units.filter(x=>x.baseId == uInfo.baseId).length == 0){
    gaInfo.units.push({
      baseId: uInfo.baseId,
      nameKey: uInfo.nameKey,
      combatType: uInfo.combatType
    })
    await mongo.set('ga', { _id: dObj.allyCode.toString() }, gaInfo)
  }
  msg2send = await showSettings(obj, opt, dObj, gaInfo)
  return msg2send
}
