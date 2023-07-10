'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let allyCode, pObj, discordId, msg2send = {content: 'Error with provided information'}
    allyCode = await HP.GetOptValue(opt, 'allycode')
    if(!allyCode){
      msg2send.content = 'error getting player allyCode'
      const allyObj = await HP.GetPlayerAC(obj, opt)
      if(allyObj?.allyCode) allyCode = allyObj.allyCode
    }
    if(allyCode){
      msg2send.content = 'error getting guild for player with allyCode '+allyCode
      pObj = await Client.post('queryPlayer', {allyCode: allyCode.toString()}, null)
    }
    if(pObj?.guildId){
      await mongo.set('guilds', {_id: pObj.guildId}, {sync: 0, guildName: pObj.guildName})
      msg2send.content = pObj.guildName+' has been removed for player sync'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
