'use strict'
const mongo = require('mongoclient')
const { getOptValue, getDiscordAC } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'Your allyCode is not linked to your discord id'}
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  let confirm = getOptValue(opt, 'confirm')
  if(dObj?.allyCode) msg2send.content = 'Command Canceled'
  if(dObj?.allyCode && confirm){
    if(dObj.uId && dObj.type){
      msg2send.content = 'Authorization for bot to login to account for allyCode **'+dObj.allyCode+'** has been removed'
      await mongo.unset('discordId', {_id: obj.member.user.id, 'allyCodes.allyCode': dObj.allyCode}, {'allyCodes.$.uId': dObj.uId, 'allyCodes.$.type': dObj.type})
      await mongo.del('tokens', {_id: dObj.uId})
      await mongo.del('facebook', {_id: dObj.uId})
      await mongo.del('identity', {_id: dObj.uId})
    }else{
      msg2send.content = 'allyCode **'+dObj.allyCode+'** does not have bot login auth set up.'
    }
  }
  return msg2send
}
