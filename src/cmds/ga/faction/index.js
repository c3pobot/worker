'use strict'
const { getGAInfo } = require('src/cmds/ga/helpers')
const { getTopUnits, getDiscordAC, getOptValue, replyButton, findFaction } = require('src/helpers')
const getImg = require('src/cmds/faction/compare/getImg')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have a allyCode linked to discord Id'}
  if(obj.confirm) await replyButton(obj)
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  let combatType = getOptValue(opt, 'option', 1)
  if(!dObj?.allyCode) return msg2send

  let gaInfo = await getGAInfo(dObj.allyCode)
  if(!gaInfo?.currentEnemy) return { content: 'You do not have a GA opponent configured' }

  let faction = getOptValue(opt, 'faction')?.toString()?.trim()
  if(!faction) return { content: 'you did not supply a faction to search'}

  let fInfo = await findFaction(obj, faction)
  if(fInfo === 'GETTING_CONFIRMATION') return
  if(!fInfo?.units) return { content: `Error finding faction **${faction}**..`}

  if(fInfo?.units) fInfo.units = fInfo.units.filter(x=>x.combatType === +combatType);
  await replyButton(obj, 'Getting info for **'+fInfo.nameKey+'** ...')
  let [ pObj, eObj ] = await Promise.allSettled([
    swgohClient.post('fetchGAPlayer', { playerId: gaInfo.playerId, allyCode: dObj.allyCode, opponent: dObj.allyCode }),
    swgohClient.post('fetchGAPlayer', { playerId: gaInfo.currentEnemy, opponent: dObj.allyCode})
  ])
  if(!pObj?.value?.playerId) return { content: 'error getting player info' }
  if(!eObj?.value?.playerId) return { content: 'error getting opponent info' }

  pObj = pObj.value, eObj = eObj.value
  msg2send = await getImg(fInfo, pObj, eObj)
  return msg2send
}
