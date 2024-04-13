'use strict'
const getImg = require('./getImg')
const { buttonPick, getPlayerId } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'Your allyCode is not linked to your discord id'}, playerId, method = 'PATCH'
  if(obj.confirm) method = 'POST'
  let allyObj = await getPlayerId(obj, opt)
  if(allyObj.mentionError) msg2send.content = 'That user does not have allyCode linked to discordId'
  if(allyObj?.allyCode) playerId = allyObj.playerId
  if(playerId) msg2send = await getImg(playerId, opt, obj)
  if(msg2send?.components){
    await buttonPick(obj, msg2send, method)
    return
  }
  return msg2send
}
