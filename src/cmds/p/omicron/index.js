'use strict'
const getImg = require('./getImg')

const { getPlayerAC, fetchPlayer } = require('src/helpers')

module.exports = async(obj, opt = {})=>{
  let allyObj = await getPlayerAC(obj, opt)
  let allyCode = allyObj?.allyCode
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  if(!allyCode) return { content: 'You do not have allycode linked to discordId' }

  let pObj = await fetchPlayer({ allyCode: allyCode.toString() })
  if(!pObj?.allyCode) return { content: 'error getting player info' }

  return await getImg(pObj, opt)
}
