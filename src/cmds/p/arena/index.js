'use strict'
const getImg = require('./getImg')

const { getPlayerAC, fetchPlayer } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let allyObj = await getPlayerAC(obj, opt)
  let allyCode = allyObj?.allyCode
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  if(!allyCode) return { content: 'your allyCode is not linked to your discordId' }

  let arenaType = opt.option?.value?.toString()?.trim() || 'ship'
  let pObj = await fetchPlayer({ allyCode: allyCode.toString() })
  if(!pObj?.arena) return { content: 'error getting player data' }
  if(!pObj.arena[arenaType]) return { content: `error geting arena ${arenaType} data` }

  return await getImg(pObj, arenaType)
}
