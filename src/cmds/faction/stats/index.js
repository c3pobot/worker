'use strict'
const getImg = require('./getImg')
const { getOptValue, findFaction, replyButton, fetchPlayer, getPlayerAC, getDiscordAC } = require('src/helpers')

module.exports = async(obj, opt)=>{
  let msg2send = {content: 'Error with provided information'}, fInfo, fInfo2, allyObj, pObj, webUnits, factionImage, webData
  let faction = getOptValue(opt, 'faction')
  let faction2 = await getOptValue(opt, 'faction-2')
  if(faction2) faction2 = faction2.toString().trim()
  let combatType = gGetOptValue(opt, 'option', 1)
  if(combatType) combatType = +combatType
  if(faction){
    faction = faction.toString().trim()
    msg2send.content = 'Error finding faction **'+faction+'**'
    fInfo = await findFaction(obj, faction)
    if(fInfo?.units) fInfo.units = fInfo.units.filter(x=>x.combatType == combatType);
    if(faction2){
      fInfo2 = (await mongo.find('factions', {_id: faction2}, {units: 1, nameKey: 1}))[0]
      if(fInfo2?.units?.length > 0 && fInfo?.units) fInfo.units = fInfo.units.filter(x=>fInfo2.units.includes(x.baseId))
    }
  }
  if(fInfo) allyObj = await getPlayerAC(obj, opt)
  if(allyObj && !allyObj?.allyCode && !allyObj?.mentionError) msg2send.content = 'You do not have allycode linked to discordId'
  if(allyObj?.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
  if(fInfo && allyObj?.allyCode){
    await replyButton(obj, 'Getting info for faction **'+fInfo.nameKey+(fInfo2?.nameKey ? ' '+fInfo2.nameKey:'')+'** ...')
    msg2send.content = 'Error getting player info'
    pObj = await fetchPlayer({allyCode: allyObj.allyCode.toString()})
  }
  if(pObj?.allyCode) msg2send = await getImg(fInfo, pObj, fInfo2)
  return msg2send
}
