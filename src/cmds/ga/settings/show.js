'use strict'
const { getGAInfo } = require('src/cmds/ga/helpers')
const { getDiscordAC, replyButton } = require('src/helpers')
const swgohClient = require('src/swgohClient')
const getUnits = (pObj = {}, units = [], msg2send = { embeds: []}, type)=>{
  let unitMsg = {
    color: 15844367,
    title: `${pObj.name} ${type} units for GA comparison`,
    description: '```\n'
  }
  for(let i in units) unitMsg.description += units[i].nameKey+'\n';
  unitMsg.description += '```'
  msg2send.embeds.push(unitMsg)
}

module.exports = async(obj = {}, opt = [], dObj, gaInfo)=>{
  let msg2send = {content: 'Your allyCode is not linked to your discord id'}, pObj, charUnits = [], shipUnits = []
  if(!dObj) dObj = await getDiscordAC(obj.member.user.id, opt)
  if(dObj && dObj.allyCode && (!gaInfo || !gaInfo.units)){
    msg2send.content = 'You have no units set for comparison'
    gaInfo = await getGAInfo(dObj.allyCode)
    if(!gaInfo) gaInfo = {units: [], enemies: []}
  }
  if(gaInfo.units.length > 0){
    pObj = await swgohClient.post('fetchPlayer', {allyCode: +dObj.allyCode}, null)
  }
  if(pObj?.allyCode){
    msg2send.content = null
    msg2send.embeds = []
    if(gaInfo.units.filter(x=>x.combatType == 1).length > 0) charUnits = await sorter([{column: 'nameKey', order: 'ascending'}], gaInfo.units.filter(x=>x.combatType == 1))
    if(gaInfo.units.filter(x=>x.combatType == 2).length > 0) shipUnits = await sorter([{column: 'nameKey', order: 'ascending'}], gaInfo.units.filter(x=>x.combatType == 2))
    if(charUnits?.length > 0) getUnits(pObj, charUnits, msg2send, 'Char')
    if(shipUnits?.length > 0) getUnits(pObj, shipUnits, msg2send, 'Ship')
  }
  return msg2send
}
