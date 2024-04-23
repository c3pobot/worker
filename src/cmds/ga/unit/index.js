'use strict'
const { getGAInfo } = require('src/cmds/ga/helpers')
const getImg = require('src/cmds/p/unitCompare/getImg')
const { getOptValue, getDiscordAC, replyButton, findUnit } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'Your allyCode is not linked to your discord id'}
  if(obj.confirm) await replyButton(obj)
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.allyCode) return msg2send

  let gaInfo = await getGAInfo(dObj.allyCode)
  if(!gaInfo?.currentEnemy) return { content: 'you do not have an opponent set' }

  let unit = getOptValue(opt, 'unit')?.toString()?.trim()
  if(!unit) return { content: 'you did not specify a unit' }

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(!uInfo.baseId) return { content: `Error finding **${unit}**` }

  let [ pObj, eObj ] = await Promise.allSettled([
    swgohClient.post('fetchGAPlayer', { playerId: gaInfo.playerId, allyCode: dObj.allyCode, opponent: dObj.allyCode }),
    swgohClient.post('fetchGAPlayer', { playerId: gaInfo.currentEnemy, opponent: dObj.allyCode})
  ])
  if(!pObj?.value?.playerId) return { content: 'error getting player info' }
  if(!eObj?.value?.playerId) return { content: 'error getting opponent info' }

  pObj = pObj.value, eObj = eObj.value
  msg2send = await getImg(uInfo, pObj, eObj)
  
  return msg2send
}
