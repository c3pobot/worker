'use strict'
const { getGAInfo } = require('src/cmds/ga/helpers')
const getImg = require('src/cmds/ga/history/getImg')
const { getDiscordAC, getOptValue } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let allyCode, msg2send = {content: 'Your allyCode is not linked to your discord id'}, gaInfo, enemyId
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(dObj?.allyCode){
    msg2send.content = 'You have no GA opponents registered'
    gaInfo = await getGAInfo(dObj.allyCode)
  }
  if(gaInfo.currentEnemy && gaInfo.enemies){
    msg2send.content = 'error getting ga opponent'
    enemyId = gaInfo.currentEnemy
  }
  if(enemyId) msg2send = await getImg(enemyId, opt, obj)
  return msg2send
}
