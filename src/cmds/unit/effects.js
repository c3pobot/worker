'use strict'
const enumSkill = (id)=>{
  if(id.startsWith('basic')) return 'B'
  if(id.startsWith('lead')) return 'L'
  if(id.startsWith('special')) return 'S'
  if(id.startsWith('unique')) return 'U'
  if(id.startsWith('hardware')) return 'R'
}
const mongo = require('mongoclient')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'you did not provide the correct information'}
  let effect = getOptValue(opt, 'effect')?.trim()
  if(!effect) return msg2send
  let show = getOptValue(opt, 'show', 'chars')?.trim()
  let skillType = getOptValue(opt, 'ability-type')
  msg2send.content = 'Error finding effect **'+effect+'**'
  let effects = (await mongo.find('effects', {_id: effect}))[0]
  if(!effects) effects = (await mongo.find('effects', {nameKey: effect}))[0]
  if(!effects || effects?.length === 0) return msg2send
  msg2send.content = 'There are no units for **'+effects.nameKey+'**'
  if(!effects?.units || effects?.units?.length === 0) return msg2send
  let units = effects.units
  units = units.filter(x=>x.skill?.descKey.toLowerCase().includes(effects.nameKey.toLowerCase()))
  if(units) units = sorter([{column: 'nameKey', order: 'ascending'}], units)
  if(skillType){
    msg2send.content = 'There are no units for **'+effects.nameKey+'** for **'+skillType+'**'
    units = units.filter(x=>x.skillId.startsWith(`${skillType}skill_`))
  }
  if(units?.length > 0){
    let ships = units.filter(x=>x.combatType === 2)
    let chars = units.filter(x=>x.combatType === 1)
    msg2send.embeds = []
    const embedMsg = {
      color: 15844367,
      timestamp: new Date()
    }
    if(show !== 'ships' && chars?.length > 0){
      embedMsg.title = 'Characters : '+effects.nameKey+' ('+chars.length+')'
      embedMsg.description = ''
      if(skillType) embedMsg.description += `Ability Type : ${skillType}\n\n`
      embedMsg.description += effects.descKey+'\n```'
      for(let i in chars) embedMsg.description += chars[i].nameKey+' : '+enumSkill(chars[i]?.skill?.id)+' : '+chars[i].skill?.nameKey+'\n'
      embedMsg.description += '```'
      msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
    }
    if(show !== 'chars' && ships?.length > 0){
      embedMsg.title = 'Ships : '+effects.nameKey+' ('+ships.length+')'
      embedMsg.description = effects.descKey+'\n```'
      for(let i in ships) embedMsg.description += ships[i].nameKey+' : '+enumSkill(ships[i]?.skill?.id)+' : '+ships[i].skill?.nameKey+'\n'
      embedMsg.description += '```'
      msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
    }
    if(msg2send.embeds.length > 0) msg2send.content = null
  }
  return msg2send
}
