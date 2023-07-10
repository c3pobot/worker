'use strict'
const { GetGAInfo } = require('src/cmds/ga/helpers')
const GetImg = require('src/cmds/p/unitCompare/getImg')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'Your allyCode is not linked to your discord id'}, unit, uInfo, guildId, pObj, eObj, gaInfo
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(dObj?.allyCode){
      msg2send.content = 'You do not have a GA opponent configured'
      gaInfo = await GetGAInfo(dObj.allyCode)
    }
    if(gaInfo?.currentEnemy){
      msg2send.content = 'you did not specify a unit'
      unit = HP.GetOptValue(opt, 'unit')
    }
    if(unit){
      unit = unit.toString().trim()
      msg2send.content = 'error finding unit **'+unit+'**'
      pObj = await Client.post('fetchGAPlayer', {id: +dObj.allyCode, opponent: dObj.allyCode}, null)
      if(pObj && pObj.guildId) guildId = pObj.guildId
      uInfo = await HP.FindUnit(obj, unit, guildId)
    }
    if(uInfo){
      await HP.ReplyButton(obj, 'Getting info for **'+uInfo.nameKey+'** ...')
      msg2send.content = 'Error getting player info'
      eObj = await Client.post('fetchGAPlayer', {id: gaInfo.currentEnemy, opponent: dObj.allyCode}, null)
    }
    if(pObj?.allyCode && eObj?.allyCode) msg2send = await GetImg(uInfo, pObj, eObj)
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
