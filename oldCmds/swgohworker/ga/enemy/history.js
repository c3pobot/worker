'use strict'
const { GetGAHist, GetGAInfo } = require('src/cmds/ga/helpers')
const GetImg = require('src/cmds/ga/history/getImg')
module.exports = async(obj, opt = [])=>{
  try{
    let allyCode, msg2send = {content: 'Your allyCode is not linked to your discord id'}, gaInfo, enemyId
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    const mode = HP.GetOptValue(opt, 'mode')
    if(dObj && dObj.allyCode){
      msg2send.content = 'You have no GA opponents registered'
      gaInfo = await GetGAInfo(dObj.allyCode)
    }
    if(gaInfo.currentEnemy && gaInfo.enemies){
      msg2send.content = 'error getting ga opponent'
      enemyId = gaInfo.currentEnemy
    }
    if(enemyId) msg2send = await GetImg(enemyId, opt, obj)
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
