'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const getImg = require('src/cmds/faction/compare/getImg')

const { getTopUnits, getDiscordAC, findFaction } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  let allyCode = dObj?.allyCode
  if(!allyCode) return { content: 'Your allyCode is not linked to your discord id' }

  let gaInfo = (await mongo.find('ga', {_id: allyCode.toString()}))[0]
  if(!gaInfo?.currentEnemy) return { content: 'You do not have a GA opponent configured' }

  let faction = opt.faction1 || opt.faction?.value?.toString()?.trim(), faction2 = opt['faction-2']?.value?.toString()?.trim(), combatType = +(opt.option?.value || 1)
  let msg2send = {content: 'Error with provided information'}
  if(!faction || !combatType) return { content: 'error with provided information' }

  let tempFaction = obj.confirm?.baseId
  if(opt.faction1 && obj.confirm) delete obj.confirm.baseId
  let fInfo2, fInfo = await findFaction(obj, faction)
  if(fInfo === 'GETTING_CONFIRMATION') return
  if(fInfo?.msg2send) return fInfo?.msg2send
  if(!fInfo?.units || fInfo?.units?.length == 0) return { content: `Error finding faction **${faction}**` }

  if(fInfo.units) fInfo.units = fInfo.units.filter(x=>x.combatType === combatType)
  if(!fInfo?.units || fInfo?.units?.length == 0) return { content: `${fInfo.nameKey} has not units of type ${combatType}...` }

  if(!opt.faction1 && obj.confirm) delete obj.confirm.baseId
  if(tempFaction && opt.faction1) obj.confirm.baseId = tempFaction
  obj.data.options.faction1 = fInfo.baseId
  if(faction2){
    fInfo2 = await findFaction(obj, faction2, false)
    if(fInfo2 === 'GETTING_CONFIRMATION') return
    if(fInfo2?.msg2send) return fInfo2?.msg2send
    if(!fInfo2?.units || fInfo2?.units?.length == 0) return { content: `Error finding 2nd faction **${faction2}**` }

    fInfo.units = fInfo.units.filter(x=>fInfo2.units.includes(x.baseId))
    if(!fInfo?.units || fInfo?.units?.length == 0) return { content: `${fInfo.nameKey} has no units of type ${combatType} in common with ${fInfo2?.nameKey}` }
  }

  let [ pObj, eObj ] = await Promise.allSettled([
    swgohClient.post('fetchGAPlayer', { playerId: gaInfo.playerId, allyCode: dObj.allyCode, opponent: dObj.allyCode }),
    swgohClient.post('fetchGAPlayer', { playerId: gaInfo.currentEnemy, opponent: dObj.allyCode})
  ])
  if(!pObj?.value?.playerId) return { content: 'error getting player info' }
  if(!eObj?.value?.playerId) return { content: 'error getting opponent info' }

  return await getImg(fInfo, pObj.value, eObj.value)
}
