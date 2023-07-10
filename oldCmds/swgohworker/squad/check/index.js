'use strict'
const GetImg = require('./getImg')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'You did not provide a squad name', components: []}, dId, allyCode, pObj
    let squadName = await HP.GetOptValue(opt, 'name')
    if(squadName) msg2send.content = 'Error finding squad **'+squadName+'**'
    let squad = await HP.Squads.GetSquad(obj, opt)
    if(squad){
      msg2send.content = 'You do not have allyCode linked to discordId'
      const allyObj = await HP.GetPlayerAC(obj, opt)
      if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
      if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    }
    if(allyCode){
      msg2send.content = 'Error getting player data'
      pObj = await HP.FetchPlayer({token: obj.token, allyCode: allyCode.toString()})
    }
    if(pObj?.rosterUnit) msg2send = await GetImg(squad, pObj, 'yes')
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
  }
}
