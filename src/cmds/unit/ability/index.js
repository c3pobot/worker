'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const numeral = require('numeral')
const getAbilityDamage = require('./getAbilityDamage')

const { replyComponent, findUnit } = require('src/helpers')

const damageTypes = {
  'ATTACK_DAMAGE': 'Physical Damage',
  'ABILITY_POWER': 'Special Damage',
  'MAX_HEALTH': 'Max Health'
}
const cleanDesc = (string)=>{
  let retString = '', array = []
  string = string.replace(/\[c\]/g, '**')
  string = string.replace(/\[\/c]/g, '**')
  string = string.replace(/\[-\]/g, '')
  string = string.replace(/\[\w{1,6}\]/g, '')
  /*
  string = string.replace(/\[ffff33\]/g, '')
  string = string.replace(/\[f0ff23\]/g, '')
  string = string.replace(/\[FFCC33\]/g, '')
  */
  array = string.split('\\n')
  for(let i in array) retString += array[i].replace('\\n', '')+'\n'
  return retString
}
const enumSkill = {
  b: 'Basic',
  l: 'Leader',
  s: 'Special',
  h: 'Reinforcement',
  u: 'Unique'
}

module.exports = async(obj = {}, opt = [])=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let unit = opt.unit?.value?.toString()?.trim()
  if(!unit) return { content: 'unit not provided' }

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(uInfo?.baseId) uInfo = (await mongo.find('skills', { _id: uInfo.baseId }))[0]
  if(!uInfo?.baseId) return { content: 'Error finding unit **'+unit+'**' }

  let skillType = opt.type?.value, skillIndex = obj.confirm?.skillIndex

  let skills = Object.values(uInfo.skills) || [], skill
  if(uInfo?.ultimate?.length > 0) skills = skills.concat(Object.values(uInfo.ultimate))
  if(skillType) skills = skills?.filter(x=>x.abilityId?.startsWith(skillType))
  skills = sorter([{column: 'abilityId', order: 'ascending'}], skills || [])
  if(!skills || skills?.length == 0) return { content: `Error getting skills for **${uInfo.nameKey}**` }

  if(skills.length === 1) skill = skills[0]
  if(!skill && skillIndex >= 0) skill = skills[skillIndex]
  if(!skill && skills.length > 0){
    let x = 0, msg2send = {
      content: 'Please Choose skill below for **'+uInfo.nameKey+'**',
      components: []
    }
    for(let i = 0; i < skills.length; i++){
      if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: [] }
      let skillLabel = skills[i].abilityId?.charAt(0).toUpperCase()
      if(skillLabel == 'h') skillLabel = 'R'
      if(skills[i].abilityId?.startsWith('ult')) skillLabel = 'Ult'
      skillLabel += ' - '+skills[i].nameKey
      msg2send.components[x].components.push({
        type: 2,
        label: skillLabel,
        style: 1,
        custom_id: JSON.stringify({id: obj.id, dId: obj.member?.user?.id, baseId: uInfo.baseId, skillIndex: +i})
      })
      if(msg2send.components[x].components.length == 5) x++;
    }
    if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: [] }
    msg2send.components[x].components.push({
      type: 2,
      label: 'Cancel',
      style: 4,
      custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, cancel: true })
    })
    await replyComponent(obj, msg2send)
    return
  }

  if(!skill) return { content: `Error getting skill for **${uInfo.nameKey}**`}

  let aInfo = getAbilityDamage(skill), maxTierIndex = 0, skillCoolDown
  if(skill?.tiers?.length > 0){
    maxTierIndex = skill.tiers.length - 1
    skillCoolDown = skill.tiers[maxTierIndex]?.cooldownMaxOverride || 0
  }
  let msgTitle = enumSkill[skill.abilityId.charAt(0)]
  if(skill.abilityId.startsWith('ult')) msgTitle = 'Ultimate'
  msgTitle += ' - '+skill.nameKey
  if(skill.omiTier){
    msgTitle += ' (O)'
  }else{
    if(skill.zetaTier) msgTitle += ' (Z)'
  }
  let embedMsg = {
    color: 15844367,
    title: uInfo.nameKey+'\n'+msgTitle,
  }
  if(skillCoolDown) embedMsg.description = `**${skillCoolDown} turn cooldown**\n\n`
  if(!embedMsg.description) embedMsg.description = ''
  embedMsg.description += cleanDesc(skill.descKey)

  if(aInfo?.length > 0){
    embedMsg.description += '\n**Ability Multiper**\n'
    for(let i in aInfo) embedMsg.description += aInfo[i].type+' x '+numeral(aInfo[i].multipler).format('0.000')+'\n'
  }
  return { content: null, embeds: [embedMsg] }
}
