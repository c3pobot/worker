'use strict'
const { GetGAHist, GetGAInfo } = require('src/cmds/ga/helpers')
const GetImg = require('src/cmds/p/unit/basic/getImg')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'Your allyCode is not linked to your discord id'}, unit, uInfo, guildId, eObj, gaInfo
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(dObj && dObj.allyCode){
      msg2send.content = 'You do not have a GA opponent configured'
      const pObj = await HP.GetGuildId({dId: obj.member.user.id}, dObj, opt)
      if(pObj && pObj.guildId) guildId = pObj.guildId
      gaInfo = await GetGAInfo(dObj.allyCode)
    }
    if(gaInfo && gaInfo.currentEnemy){
      msg2send.content = 'you did not specify a unit'
      unit = HP.GetOptValue(opt, 'unit')
      if(unit) unit = unit.toString().trim()
    }
    if(unit){
      msg2send.content = 'error finding unit **'+unit+'**'
      uInfo = await HP.FindUnit(obj, unit, guildId)
    }
    if(uInfo){
      await HP.ReplyButton(obj, 'Getting info for **'+uInfo.nameKey+'** ...')
      msg2send.content = 'Error getting player info'
      eObj = await Client.post('fetchGAPlayer', {id: gaInfo.currentEnemy, opponent: dObj.allyCode}, null)
    }
    if(eObj?.allyCode) msg2send = await GetImg(uInfo, eObj)
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
