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

  let faction = opt.faction1 || opt.faction?.value?.toString()?.trim(), faction2 = opt.faction2 ||opt['faction-2']?.value?.toString()?.trim(), combatType = +(opt.option?.value || 1)
  let faction_exclude = opt['faction-exclude']?.value?.toString()?.trim()
  let msg2send = {content: 'Error with provided information'}
  if(!faction || !combatType) return { content: 'error with provided information' }

  let tempFaction = obj.confirm?.baseId
  if(opt.faction1 && obj.confirm) delete obj.confirm.baseId

  let fInfo2, eInfo, fInfo = await findFaction(obj, faction)
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
    obj.data.options.faction2 = fInfo2.baseId
  }
  if(faction_exclude){
    eInfo = await findFaction(obj, faction_exclude, false)
    if(eInfo === 'GETTING_CONFIRMATION') return
    if(eInfo?.msg2send) return eInfo?.msg2send
    if(!eInfo?.units || eInfo?.units?.length == 0) return { content: `Error finding faction **${faction_exclude}** to exclude` }

    fInfo.units = fInfo.units.filter(x=>!eInfo.units.includes(x.baseId))
    if(!fInfo?.units || fInfo?.units?.length == 0) return { content: `You have excluded all units from ${fInfo.nameKey} of type ${combatType} with exclusion ${eInfo.nameKey}` }
  }
  let [ pObj, eObj ] = await Promise.allSettled([
    fetchPlayer({ allyCode: pAlly.allyCode?.toString() }),
    fetchPlayer({ allyCode: eAlly.allyCode?.toString() })
  ])

  if(!pObj?.value?.allyCode) return { content: 'Error getting your data...' }
  if(!eObj?.value?.allyCode) return { content: 'Error getting player data to compare...' }

  return await getImg(fInfo, pObj.value, eObj.value, fInfo2, eInfo)
}
