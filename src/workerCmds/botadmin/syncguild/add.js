'use strict'
const { GetAllyCodeObj, GetOptValue, ReplyMsg } = require('helpers')
const mongo = require('mongoclient')
const swgohClient = require('swgohClient')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let allyCode, pObj, discordId, msg2send = {content: 'Error with provided information'}
    let allyCode = GetOptValue(opt, 'allycode')
    if(!allyCode){
      msg2send.content = 'error getting player allyCode'
      let allyObj = await GetAllyCodeObj(obj, opt)
      if(allyObj?.allyCode) allyCode = allyObj.allyCode
    }
    if(allyCode){
      msg2send.content = 'error getting guild for player with allyCode '+allyCode
      pObj = await swgohClient('queryPlayer', { allyCode: allyCode.toString() })
    }
    if(pObj?.guildId){
      await mongo.set('guilds', {_id: pObj.guildId}, {sync: 1, guildName: pObj.guildName})
      msg2send.content = pObj.guildName+' has been set for player sync'
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e);
  }
}
