'use strict'
const GetImg = require('./getImg')
module.exports = async(obj, opt)=>{
  try{
    let msg2send = {content: 'Error with provided information'}, fInfo, fInfo2, allyObj, pObj
    let faction = await HP.GetOptValue(opt, 'faction')
    let faction2 = await HP.GetOptValue(opt, 'faction-2')
    if(faction2) faction2 = faction2.toString().trim()
    if(faction) faction = faction.toString().trim()

    let combatType = HP.GetOptValue(opt, 'option', 1)
    if(combatType) combatType = +combatType
    if(faction){
      msg2send.content = 'Error finding faction **'+faction+'**'
      fInfo = await HP.FindFaction(obj, faction)
      if(fInfo?.units) fInfo.units = fInfo.units.filter(x=>x.combatType === combatType)
      if(faction2){
        fInfo2 = (await mongo.find('factions', {_id: faction2}, {units: 1, nameKey: 1}))[0]
        if(fInfo2?.units?.length > 0 && fInfo?.units) fInfo.units = fInfo.units.filter(x=>fInfo2.units.includes(x.baseId))
      }
    }
    if(fInfo) allyObj = await HP.GetPlayerAC(obj, opt)
    if(allyObj && !allyObj.allyCode && !allyObj.mentionError) msg2send.content = 'You do not have allycode linked to discordId'
    if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(fInfo && allyObj?.allyCode){
      await HP.ReplyButton(obj, 'Getting info for faction **'+fInfo.nameKey+(fInfo2?.nameKey ? ' '+fInfo2.nameKey:'')+'** ...')
      msg2send.content = 'Error getting player info'
      pObj = await HP.FetchPlayer({allyCode: allyObj.allyCode.toString()})
    }
    if(pObj?.allyCode) msg2send = await GetImg(fInfo, pObj, fInfo2)
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
