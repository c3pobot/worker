'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'You allyCode is not linked to your discordId or you are not part of a guild'}, unit, uInfo, guildId
    const pObj = await HP.GetGuildId({dId: obj.member.user.id}, {}, opt)
    if(pObj && pObj.guildId){
      msg2send.content = 'You must provide a unit'
      guildId = pObj.guildId
      unit = HP.GetOptValue(opt, 'unit')
      if(unit) unit = unit.toString().trim()
    }
    if(unit){
      msg2send.content = 'Error finding unit **'+unit+'**'
      uInfo = await HP.FindUnit(obj, unit, guildId)
    }
    if(uInfo){
      await HP.ReplyButton(obj, 'Getting guild info for...')
      await mongo.pull('guilds', {_id: guildId}, {units: {baseId: uInfo.baseId}})
      msg2send.content = '**'+uInfo.nameKey+'** was removed as a unit for guild/tw report'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
