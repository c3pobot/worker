'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const getImg = require('src/cmds/faction/stats/getImg')

const { getDiscordAC, findFaction } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  let allyCode = dObj?.allyCode
  if(!allyCode) return { content: 'Your allyCode is not linked to your discord id' }

  let gaInfo = (await mongo.find('ga', {_id: allyCode.toString()}))[0]
  if(!gaInfo?.currentEnemy) return { content: 'You do not have a GA opponent configured' }

  let faction = opt.faction?.value?.toString()?.trim(), faction2 = opt['faction-2']?.value?.toString()?.trim(), combatType = +(opt.option?.value || 1)
  let msg2send = {content: 'Error with provided information'}
  if(!faction || !combatType) return { content: 'error with provided information' }

  if(fInfo.units) fInfo.units = fInfo.units.filter(x=>x.combatType === combatType)
  if(!fInfo?.units || fInfo?.units?.length == 0) return { content: `${fInfo.nameKey} has not units of type ${combatType}...` }

  obj.data.options.faction = fInfo.baseId
  if(faction2){
    fInfo2 = await findFaction(obj, faction2)
    if(fInfo2?.msg2send) return fInfo2?.msg2send
    if(!fInfo2?.units || fInfo2?.units?.length == 0) return { content: `Error finding 2nd faction **${faction2}**` }

    fInfo.units = fInfo.units.filter(x=>fInfo2.units.includes(x.baseId))
    if(!fInfo?.units || fInfo?.units?.length == 0) return { content: `${fInfo.nameKey} has no units of type ${combatType} in common with ${fInfo2?.nameKey}` }
  }
  let eObj = await swgohClient.post('fetchGAPlayer', { playerId: gaInfo.currentEnemy, opponent: dObj.allyCode })
  if(!eObj?.rosterUnit) return { content: 'Error getting opponent roster...' }

  return await getImg(fInfo, eObj)
}