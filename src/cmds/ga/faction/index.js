'use strict'
const { getGAInfo } = require('src/cmds/ga/helpers')
const { getTopUnits, getDiscordAC, getOptValue, replyButton } = require('src/helpers')
const getImg = require('src/cmds/faction/compare/getImg')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have a allyCode linked to discord Id'}, faction, fInfo, pObj, eObj, gaInfo, pUnits, eUnits, fUnits, factionImage, webData
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  let combatType = getOptValue(opt, 'option', 1) || 1
  if(combatType) combatType = +combatType
  if(dObj?.allyCode){
    msg2send.content = 'You do not have a GA opponent configured'
    gaInfo = await getGAInfo(dObj.allyCode)
  }
  if(gaInfo?.currentEnemy){
    msg2send.content = 'you did not specify a faction'
    faction = getOptValue(opt, 'faction')
  }
  if(faction){
    faction = faction.toString().trim()
    msg2send.content = 'error finding faction **'+faction+'**'
    fInfo = await HP.FindFaction(obj, faction)
    if(fInfo === 'GETTING_CONFIRMATION') return
    if(fInfo?.units) fInfo.units = fInfo.units.filter(x=>x.combatType === combatType);
  }
  if(fInfo){
    await replyButton(obj, 'Getting info for **'+fInfo.nameKey+'** ...')
    msg2send.content = 'Error getting player data'
    pObj = await swgohClient.post('fetchGAPlayer', {id: +dObj.allyCode, opponent: dObj.allyCode}, null)
    eObj = await swgohClient.post('fetchGAPlayer', {id: gaInfo.currentEnemy, opponent: dObj.allyCode}, null)
  }
  if(pObj?.allyCode && eObj?.allyCode) msg2send = await getImg(fInfo, pObj, eObj)
  return msg2send
}
