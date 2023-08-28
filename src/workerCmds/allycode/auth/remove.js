'use strict'
const mongo = require('mongoclient')
const { GetAllyCodeFromDiscordId, GetOptValue, ReplyMsg } = require('helpers')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'Your allyCode is not linked to your discord id'}
    let dObj = await GetAllyCodeFromDiscordId(obj.member.user.id, opt)
    let confirm = GetOptValue(opt, 'confirm')
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
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
