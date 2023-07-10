'use strict'
const { GetGAInfo } = require('src/cmds/ga/helpers')
const GetImg = require('src/cmds/squad/compare/getImg')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have a allyCode linked to discord Id'}, squadName, squad, pObj, eObj, gaInfo
    const allyObj = await HP.GetPlayerAC(obj, opt)
    if(allyObj?.allyCode){
      msg2send.content = 'You do not have a GA opponent configured'
      gaInfo = await GetGAInfo(allyObj.allyCode)
    }
    if(gaInfo?.currentEnemy){
      msg2send.content = 'you did not specify a squad'
      squadName = HP.GetOptValue(opt, 'squad')
    }
    if(squadName){
      squadName = squadName.toString().trim()
      msg2send.content = 'error finding Squad **'+squadName+'**'
      squad = await HP.GetSquad(obj, opt = [], squadName.toString().toLowerCase().trim())
    }
    if(squad){
      msg2send.content = 'Error getting player data'
      pObj = await Client.post('fetchGAPlayer', {id: +allyObj.allyCode, opponent: dObj.allyCode}, null)
      eObj = await Client.post('fetchGAPlayer', {id: gaInfo.currentEnemy, opponent: dObj.allyCode}, null)
    }
    if(pObj?.rosterUnit && eObj?.rosterUnit) msg2send = await GetImg(squad, pObj, eObj)
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
