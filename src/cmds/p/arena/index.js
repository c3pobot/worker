'use strict'
const getImg = require('./getImg')
const { getOptValue, getPlayerAC, fetchPlayer } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let pObj, charArena = [], shipArena = [], allyCode, msg2send = { content: 'Error with the provided info' }, webUnits, webData, arenaImg
  let tempCmd = getOptValue(opt, 'option', 'char')
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
  if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
  if(allyCode){
    msg2send.content = 'Error getting data for allyCode **'+allyCode+'**'
    pObj = await fetchPlayer({token: obj.token, allyCode: allyCode.toString()})
  }
  if(pObj?.arena && pObj.arena[tempCmd]) msg2send = await getImg(pObj, tempCmd)
  return msg2send
}
