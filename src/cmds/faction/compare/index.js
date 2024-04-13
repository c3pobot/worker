'use strict'
const getImg = require('./getImg')
const { getOptValue, findFaction, replyButton, fetchPlayer, getPlayerAC, getDiscordAC } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You must provide another player to compare with'}, fInfo, fInfo2, allyObj, pObj, eObj
  let faction = getOptValue(opt, 'faction')
  if(faction) faction = faction.toString().trim()
  let faction2 = await getOptValue(opt, 'faction-2')
  if(faction2) faction2 = faction2.toString().trim()
  let combatType = getOptValue(opt, 'option', 1)
  if(combatType) combatType = +combatType
  const eAlly = await getPlayerAC(obj, opt)
  const pAlly = await getDiscordAC(obj.member.user.id, opt)
  if(!pAlly) msg2send.content = 'You do not have allycode linked to discordId'
  if(pAlly && eAlly && eAlly.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
  if(faction){
    msg2send.content = 'Error finding faction **'+faction+'**'
    fInfo = await findFaction(obj, faction)
    if(fInfo === 'GETTING_CONFIRMATION') return
    if(fInfo?.units) fInfo.units = fInfo.units.filter(x=>x.combatType === combatType);
    if(faction2){
      fInfo2 = (await mongo.find('factions', {_id: faction2}, {units: 1, nameKey: 1}))[0]
      if(fInfo2?.units?.length > 0 && fInfo?.units) fInfo.units = fInfo.units.filter(x=>fInfo2.units.includes(x.baseId))
    }
  }
  if(fInfo && pAlly?.allyCode && eAlly?.allyCode && pAlly.allyCode != eAlly.allyCode){
    await replyButton(obj, 'Getting info for faction **'+fInfo.nameKey+(fInfo2?.nameKey ? ' '+fInfo2.nameKey:'')+'** ...')
    msg2send.content = 'Error pullling player info'
    pObj = await fetchPlayer({allyCode: pAlly.allyCode.toString()})
    eObj = await fetchPlayer({allyCode: eAlly.allyCode.toString()})
  }
  if(pObj?.allyCode && eObj?.allyCode) msg2send = await getImg(fInfo, pObj, eObj, fInfo2)
  return msg2send
}
