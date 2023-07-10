'use strict'
const { GetGAHist, GetGAInfo } = require('src/cmds/ga/helpers')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'Your allyCode is not linked to your discord id'}, gaInfo
    const confirm = HP.GetOptValue(opt, 'confirm')
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(dObj && dObj.allyCode){
      msg2send.content = 'command canceled'
      gaInfo = await GetGAInfo(dObj.allyCode)
    }
    if(gaInfo && confirm){
      await mongo.delMany('gaCache', {opponent: +dObj.allyCode});
      await mongo.unset('ga', {_id: dObj.allyCode.toString()}, {currentEnemy: gaInfo.currentEnemy});
      await mongo.set('ga', {_id: dObj.allyCode.toString()}, {enemies: []})
      msg2send.content = 'Your GA opponent data has been cleared'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
