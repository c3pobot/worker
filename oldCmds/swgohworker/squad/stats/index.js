'use strict'
const GetImg = require('./getImg')
module.exports = async(obj, opt)=>{
  try{
    let squadName, squad, msg2send = {content: 'You do not have allyCode linked to discordId'}, squadData = {squads: [], info:{tdSpan: 0}}, allyCode, pObj
    const allyObj = await HP.GetPlayerAC(obj, opt)
    if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
    if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(opt && opt.find(x=>x.name == 'name')) squadName = opt.find(x=>x.name == 'name').value.trim().toLowerCase()
    if(allyCode){
      msg2send.content = 'Error finding squad **'+squadName+'**'
      squad = await HP.Squads.GetSquad(obj, opt, squadName)
    }
    if(squad){
      msg2send.content = 'error getting player data'
      pObj = await HP.FetchPlayer({token: obj.token, allyCode: allyCode.toString()})
    }
    if(pObj?.rosterUnit) msg2send = await GetImg(squad, pObj)
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
