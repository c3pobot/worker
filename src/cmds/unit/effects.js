'use strict'
const enumSkill = (id)=>{
  if(id.startsWith('basic')) return 'B'
  if(id.startsWith('lead')) return 'L'
  if(id.startsWith('special')) return 'S'
  if(id.startsWith('unique')) return 'U'
  if(id.startsWith('hardware')) return 'R'
}
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const { findFaction } = require('src/helpers')
module.exports = async(obj = {}, opt = {})=>{
  let effect = opt.effect?.value?.trim()
  if(!effect) return { content: 'you did not provide the correct information' }

  let show = opt.show?.value?.trim() || 'chars', skillType = opt['ability-type']?.value
  let effects = (await mongo.find('effects', {_id: effect}))[0]
  if(!effects) effects = (await mongo.find('effects', {nameKey: effect}))[0]
  if(!effects || effects?.length === 0) return { content: `Error finding effect **${effect}**`}
  let units = Object.values(effects?.units)
  if(!units || units?.length === 0) return { content: `There are no units for **${effects.nameKey}**` }
  units = units?.filter(x=>x.skill?.descKey?.toLowerCase()?.includes(effects?.nameKey?.toLowerCase()))
  if(!units || units?.length == 0) return { content: `There are no units for **${effects.nameKey}**` }

  let faction = opt.faction?.value?.toString()?.trim(), fInfo
  if(faction){
    fInfo = await findFaction(obj, faction, false)
    if(fInfo === 'GETTING_CONFIRMATION') return
    if(fInfo?.msg2send) return fInfo?.msg2send
  }
  units = sorter([{column: 'nameKey', order: 'ascending'}], units)
  if(skillType) units = units.filter(x=>x.skillId.startsWith(`${skillType}skill_`))
  if(fInfo?.units?.length > 0) units = units?.filter(x=>fInfo.units?.includes(x.baseId))
  if(!units || units?.length == 0){
    let errMsg = `There are no units for **${effects.nameKey}**`
    if(skillType) errMsg += ` for **${skillType}**`
    if(fInfo?.units) errMsg += ` for faction **${fInfo.nameKey}**`
    return { content:  errMsg }
  }

  let ships = units.filter(x=>x.combatType === 2)
  let chars = units.filter(x=>x.combatType === 1)
  let msg2send = { content: null, embeds: [] }
  let embedMsg = {
    color: 15844367,
    timestamp: new Date(),
    title: ''
  }
  if(fInfo?.nameKey) embedMsg.title += `${fInfo.nameKey} `
  if(show !== 'ships' && chars?.length > 0){
    embedMsg.title += 'Characters : '+effects.nameKey+' ('+chars.length+')'
    embedMsg.description = ''
    if(skillType) embedMsg.description += `Ability Type : ${skillType}\n\n`
    embedMsg.description += effects.descKey+'\n```'
    for(let i in chars) embedMsg.description += chars[i].nameKey+' : '+enumSkill(chars[i]?.skill?.id)+' : '+chars[i].skill?.nameKey+'\n'
    embedMsg.description += '```'
    msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
  }
  if(show !== 'chars' && ships?.length > 0){
    embedMsg.title += 'Ships : '+effects.nameKey+' ('+ships.length+')'
    embedMsg.description = effects.descKey+'\n```'
    for(let i in ships) embedMsg.description += ships[i].nameKey+' : '+enumSkill(ships[i]?.skill?.id)+' : '+ships[i].skill?.nameKey+'\n'
    embedMsg.description += '```'
    msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
  }
  if(msg2send.embeds.length > 0) return msg2send
  return { content: 'error figuring it out' }
}
