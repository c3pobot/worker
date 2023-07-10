'use strict'
const GetImg = require('./getImg')
module.exports = async(obj, opt = [])=>{
  try{
    let pObj, allyCode, msg2send = {content: 'You do not have allycode linked to discordId'}
    const allyObj = await HP.GetPlayerAC(obj, opt)
    if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
    if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(allyCode){
      msg2send.content = 'Error getting player info'
      pObj = await HP.FetchPlayer({allyCode: allyCode.toString()})
    }
    if(pObj?.allyCode) msg2send = await GetImg(pObj, opt)
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
  }
}
