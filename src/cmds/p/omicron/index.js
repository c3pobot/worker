'use strict'
const getImg = require('./getImg')
const { getPlayerAC, fetchPlayer } = require('src/helpers')

module.exports = async(obj, opt = [])=>{
  let pObj, allyCode, msg2send = {content: 'You do not have allycode linked to discordId'}
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
  if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
  if(allyCode){
    msg2send.content = 'Error getting player info'
    pObj = await fetchPlayer({allyCode: allyCode.toString()})
  }
  if(pObj?.allyCode) msg2send = await getImg(pObj, opt)
  return msg2send
}
