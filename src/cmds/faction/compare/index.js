'use strict'
const getImg = require('./getImg')
const { findFaction, fetchPlayer, getPlayerAC, getDiscordAC } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let pAlly = await getDiscordAC(obj.member?.user?.id, opt)
  if(!pAlly?.allyCode) return { content: 'You do not have allycode linked to discordId' }

  let eAlly = await getPlayerAC(obj, opt)
  if(eAlly?.mentionError) return { content: 'that user does not have allyCode linked to discordId...' }
  if(!eAlly?.allyCode) return { content: 'error getting allyCode to compare..'}

  let faction = opt.faction?.value?.toString()?.trim(), faction2 = opt['faction-2']?.value?.toString()?.trim(), combatType = +(opt.option?.value || 1)
  let msg2send = {content: 'Error with provided information'}
  if(!faction || !combatType) return { content: 'error with provided information' }

  let fInfo2, fInfo = await findFaction(obj, faction)
  if(fInfo === 'GETTING_CONFIRMATION') return
  if(fInfo?.msg2send) return fInfo?.msg2send
  if(!fInfo?.units || fInfo?.units?.length == 0) return { content: `Error finding faction **${faction}**` }

  if(fInfo.units) fInfo.units = fInfo.units.filter(x=>x.combatType === combatType)
  if(!fInfo?.units || fInfo?.units?.length == 0) return { content: `${fInfo.nameKey} has not units of type ${combatType}...` }

  obj.data.options.faction = fInfo.baseId
  if(faction2){
    fInfo2 = await findFaction(obj, faction2)
    if(fInfo2 === 'GETTING_CONFIRMATION') return
    if(fInfo2?.msg2send) return fInfo2?.msg2send
    if(!fInfo2?.units || fInfo2?.units?.length == 0) return { content: `Error finding 2nd faction **${faction2}**` }

    fInfo.units = fInfo.units.filter(x=>fInfo2.units.includes(x.baseId))
    if(!fInfo?.units || fInfo?.units?.length == 0) return { content: `${fInfo.nameKey} has no units of type ${combatType} in common with ${fInfo2?.nameKey}` }
  }

  let [ pObj, eObj ] = await Promise.allSettled([
    fetchPlayer({ allyCode: pAlly.allyCode?.toString() }),
    fetchPlayer({ allyCode: eAlly.allyCode?.toString() })
  ])

  if(!pObj?.value?.allyCode) return { content: 'Error getting your data...' }
  if(!eObj?.value?.allyCode) return { content: 'Error getting player data to compare...' }

  return await getImg(fInfo, pObj, eObj, fInfo2)
}
