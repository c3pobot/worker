'use strict'
const { getGAInfo } = require('src/cmds/ga/helpers')
const getImg = require('src/cmds/p/unit/basic/getImg')
const { getDiscordAC, getOptValue, replyButton } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'Your allyCode is not linked to your discord id'}, unit, uInfo, eObj, gaInfo
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(dObj?.allyCode){
    msg2send.content = 'You do not have a GA opponent configured'
    gaInfo = await GetGAInfo(dObj.allyCode)
  }
  if(gaInfo?.currentEnemy){
    msg2send.content = 'you did not specify a unit'
    unit = getOptValue(opt, 'unit')
  }
  if(unit){
    unit = unit.toString().trim()
    msg2send.content = 'error finding unit **'+unit+'**'
    uInfo = await findUnit(obj, unit, guildId)
    if(uInfo === 'GETTING_CONFIRMATION') return
  }
  if(uInfo){
    await replyButton(obj, 'Getting info for **'+uInfo.nameKey+'** ...')
    msg2send.content = 'Error getting player info'
    eObj = await swgohClient.post('fetchGAPlayer', {id: gaInfo.currentEnemy, opponent: dObj.allyCode}, null)
  }
  if(eObj?.allyCode) msg2send = await getImg(uInfo, eObj)
  return msg2send
}
