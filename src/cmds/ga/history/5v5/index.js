'use strict'
const getImg = require('../getImg')
const { getPlayerId } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let allyObj = await getPlayerId(obj, opt)
  let playerId = allyObj?.playerId
  if(allyObj.mentionError) msg2send.content = 'That user does not have allyCode linked to discordId'
  if(!playerId) return { content: 'Your allyCode is not linked to your discord id' }

  return await getImg(obj, opt, playerId, '5v5')
}
