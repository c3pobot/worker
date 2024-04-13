'use strict'
const { getGAInfo } = require('src/cmds/ga/helpers')
const getImg = require('src/cmds/squad/compare/getImg')
const { getPlayerAC, getOptValue, getSquad } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have a allyCode linked to discord Id'}, squadName, squad, pObj, eObj, gaInfo
  const allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.allyCode){
    msg2send.content = 'You do not have a GA opponent configured'
    gaInfo = await getGAInfo(allyObj.allyCode)
  }
  if(gaInfo?.currentEnemy){
    msg2send.content = 'you did not specify a squad'
    squadName = getOptValue(opt, 'squad')
  }
  if(squadName){
    squadName = squadName.toString().trim()
    msg2send.content = 'error finding Squad **'+squadName+'**'
    squad = await getSquad(obj, opt = [], squadName.toString().toLowerCase().trim())
  }
  if(squad){
    msg2send.content = 'Error getting player data'
    pObj = await swgohClient.post('fetchGAPlayer', {id: +allyObj.allyCode, opponent: dObj.allyCode}, null)
    eObj = await swgohClient.post('fetchGAPlayer', {id: gaInfo.currentEnemy, opponent: dObj.allyCode}, null)
  }
  if(pObj?.rosterUnit && eObj?.rosterUnit) msg2send = await getImg(squad, pObj, eObj)
  return msg2send
}
