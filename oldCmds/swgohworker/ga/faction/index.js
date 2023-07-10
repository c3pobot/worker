'use strict'
const { GetGAInfo } = require('src/cmds/ga/helpers')
const { GetTopUnits } = require('src/cmds/faction/helpers')
const GetImg = require('src/cmds/faction/compare/getImg')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have a allyCode linked to discord Id'}, faction, fInfo, pObj, eObj, gaInfo, pUnits, eUnits, fUnits, factionImage, webData
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    let combatType = HP.GetOptValue(opt, 'option', 1) || 1
    if(combatType) combatType = +combatType
    if(dObj?.allyCode){
      msg2send.content = 'You do not have a GA opponent configured'
      gaInfo = await GetGAInfo(dObj.allyCode)
    }
    if(gaInfo?.currentEnemy){
      msg2send.content = 'you did not specify a faction'
      faction = HP.GetOptValue(opt, 'faction')
    }
    if(faction){
      faction = faction.toString().trim()
      msg2send.content = 'error finding faction **'+faction+'**'
      fInfo = await HP.FindFaction(obj, faction)
      if(fInfo?.units) fInfo.units = fInfo.units.filter(x=>x.combatType === combatType);
    }
    if(fInfo){
      await HP.ReplyButton(obj, 'Getting info for **'+fInfo.nameKey+'** ...')
      msg2send.content = 'Error getting player data'
      pObj = await Client.post('fetchGAPlayer', {id: +dObj.allyCode, opponent: dObj.allyCode}, null)
      eObj = await Client.post('fetchGAPlayer', {id: gaInfo.currentEnemy, opponent: dObj.allyCode}, null)
    }
    if(pObj?.allyCode && eObj?.allyCode) msg2send = await GetImg(fInfo, pObj, eObj)
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
