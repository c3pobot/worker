'use strict'
const GetImg = require('./getImg')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'Your allyCode is not linked to your discord id'}, playerId, method = 'PATCH'
    if(obj.confirm) method = 'POST'
    const allyObj = await HP.GetPlayerId(obj, opt)
    if(allyObj.mentionError) msg2send.content = 'That user does not have allyCode linked to discordId'
    if(allyObj?.allyCode) playerId = allyObj.playerId
    if(playerId) msg2send = await GetImg(playerId, opt, obj)
    if(msg2send?.components){
      await HP.ButtonPick(obj, msg2send, method)
    }else{
      await HP.ReplyMsg(obj, msg2send)
    }

  }catch(e){
    console.error(e);
  }
}
