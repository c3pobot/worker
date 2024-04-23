'use strict'
const mongo = require('mongoclient')
const { getGAInfo } = require('src/cmds/ga/helpers')
const { getOptValue, getDiscordAC } = require('src/helpers')


module.exports = async(obj, opt = [])=>{
  let msg2send = {content: 'Your allyCode is not linked to your discord id'}, gaInfo
  let confirm = getOptValue(opt, 'confirm')
  if(!confirm) return { content: 'command canceled'}
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(dObj?.allyCode){
    msg2send.content = 'error getting gaInfo'
    gaInfo = await getGAInfo(dObj.allyCode)
  }
  if(gaInfo){
    msg2send.content = 'Your GA opponent data has been cleared'
    await mongo.delMany('gaCache', { opponent: +dObj.allyCode });
    await mongo.set('ga', { _id: dObj.allyCode.toString()}, { enemies: [], currentEnemy: null })
  }
  return msg2send
}
