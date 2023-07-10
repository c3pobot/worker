'use strict'
const GetImg = require('./getImg')
module.exports = async(obj, opt = [])=>{
  try{
    let pObj, charArena = [], shipArena = [], allyCode, msg2send = { content: 'Error with the provided info' }, webUnits, webData, arenaImg
    let tempCmd = await HP.GetOptValue(opt, 'option', 'char')
    const allyObj = await HP.GetPlayerAC(obj, opt)
    if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
    if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(allyCode){
      msg2send.content = 'Error getting data for allyCode **'+allyCode+'**'
      pObj = await HP.FetchPlayer({token: obj.token, allyCode: allyCode.toString()})
    }
    if(pObj?.arena && pObj.arena[tempCmd]) msg2send = await GetImg(pObj, tempCmd)
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
