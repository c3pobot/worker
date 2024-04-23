'use strict'
const mongo = require('mongoclient')
const { getGuildId, findUnit, getOptValue, replyButton } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You allyCode is not linked to your discordId or you are not part of a guild'}, unit, uInfo, guildId
  let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  if(pObj?.guildId){
    msg2send.content = 'You must provide a unit'
    guildId = pObj.guildId
    unit = getOptValue(opt, 'unit')
    if(unit) unit = unit.toString().trim()
  }
  if(unit){
    msg2send.content = 'Error finding unit **'+unit+'**'
    uInfo = await findUnit(obj, unit, guildId)
    if(uInfo === 'GETTING_CONFIRMATION') return
  }
  if(uInfo){
    await replyButton(obj, 'Getting guild info for...')
    await mongo.pull('guilds', {_id: guildId}, {units: {baseId: uInfo.baseId}})
    msg2send.content = '**'+uInfo.nameKey+'** was removed as a unit for guild/tw report'
  }
  return msg2send
}
