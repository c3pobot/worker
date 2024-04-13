'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const { getOptValue, getPlayerAC } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let allyCode, pObj, discordId, msg2send = {content: 'Error with provided information'}
  allyCode = await getOptValue(opt, 'allycode')
  if(!allyCode){
    msg2send.content = 'error getting player allyCode'
    let allyObj = await getPlayerAC(obj, opt)
    if(allyObj?.allyCode) allyCode = allyObj.allyCode
  }
  if(allyCode){
    msg2send.content = 'error getting guild for player with allyCode '+allyCode
    pObj = await swgohClient.post('queryPlayer', {allyCode: allyCode.toString()}, null)
  }
  if(pObj?.guildId){
    await mongo.set('guilds', {_id: pObj.guildId}, {sync: 1, guildName: pObj.guildName})
    msg2send.content = pObj.guildName+' has been set for player sync'
  }
  return msg2send
}
