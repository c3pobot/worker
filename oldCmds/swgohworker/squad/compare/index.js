'use strict'
const GetImg = require('./getImg')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'You must provide another player to compare with'}, squad, pObj, eObj
    let squadName = HP.GetOptValue(opt, 'name')
    const eAlly = await HP.GetPlayerAC(obj, opt)
    const pAlly = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(!pAlly) msg2send.content = 'You do not have allycode linked to discordId'
    if(pAlly && eAlly && eAlly.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(squadName){
      squadName = squadName.toString().trim()
      msg2send.content = 'Error finding squad **'+squadName+'**'
      squad = await HP.Squads.GetSquad(obj, opt, squadName)
    }
    if(pAlly.allyCode == eAlly.allyCode) msg2send.content = 'you can\'t compare to your self'
    if(squad && pAlly?.allyCode && eAlly?.allyCode && pAlly.allyCode != eAlly.allyCode){
      await HP.ReplyButton(obj, 'Getting info for squad **'+squadName+'** ...')
      msg2send.content = 'Error pullling player info'
      pObj = await HP.FetchPlayer({allyCode: pAlly.allyCode.toString()})
      eObj = await HP.FetchPlayer({allyCode: eAlly.allyCode.toString()})
    }
    if(pObj?.allyCode && eObj?.allyCode) msg2send = await GetImg(squad, pObj, eObj)
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
  }
}
