'use strict'
const { getGAInfo } = require('../helpers')
const getImg = require('src/cmds/faction/stats/getImg')
const { getDiscordAC, getOptValue, findFaction, replyButton } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have a allyCode linked to discord Id'}, faction, fInfo, eObj, gaInfo
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  let combatType = getOptValue(opt, 'option', 1)
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
    fInfo = await findFaction(obj, faction)
    if(fInfo === 'GETTING_CONFIRMATION') return
    if(fInfo.units) fInfo.units = fInfo.units.filter(x=>x.combatType == combatType);
  }
  if(fInfo){
    await replyButton(obj, 'Getting info for faction **'+fInfo.nameKey+'** ...')
    msg2send.content = 'Error getting player data'
    eObj = await swgohClient.post('fetchGAPlayer', { playerId: gaInfo.currentEnemy, opponent: dObj.allyCode} )
  }
  if(eObj?.allyCode) msg2send = await getImg(fInfo, eObj)
  return msg2send
}
