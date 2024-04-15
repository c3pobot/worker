'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const numeral = require('numeral')
const getAbilityDamage = require('./getAbilityDamage')

const damageTypes = {
  'ATTACK_DAMAGE': 'Physical Damage',
  'ABILITY_POWER': 'Special Damage',
  'MAX_HEALTH': 'Max Health'
}
const cleanDesc = (string)=>{
  try{
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
  }catch(e){
    console.log(e)
  }
}
const enumSkill = {
  b: 'Basic',
  l: 'Leader',
  s: 'Special',
  h: 'Reinforcement',
  u: 'Unique'
}
const { getOptValue, replyButton, buttonPick } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You did not provide the correct information'}, guildId, skills = [], skill
  let unit = getOptValue(opt, 'unit')?.toString()?.trim()
  if(!unit) return msg2send
  let skillType = getOptValue(opt, 'type')
  let skillIndex = obj.confirm?.skillIndex
  msg2send.content = 'Error getting abilityInfo for unit **'+unit+'**'
  let unitSkills = (await mongo.find('skills', {_id: unit}))[0]
  if(!unitSkills) return msg2send
  await replyButton(obj, 'Getting skill info for **'+unitSkills.nameKey+'** ...')
  msg2send.content = 'Error getting skills for **'+unitSkills.nameKey+'**'
  if(unitSkills.skills?.length > 0) skills = skills.concat(unitSkills.skills)
  if(unitSkills.ultimate?.length > 0) skills = skills.concat(unitSkills.ultimate)
  if(skills?.length > 0){
    if(skillType) skills = skills?.filter(x=>x.skillId?.startsWith(skillType))
    if(skills.length > 0) skills = sorter([{column: 'id', order: 'ascending'}], skills)
    if(skillIndex >= 0 && skills[skillIndex]) skills = [skills[skillIndex]]
  }
  if(skills?.length > 1){
    let pickMsg = {
      content: 'Please Choose skill below for **'+unitSkills.nameKey+'**',
      components: []
    }
    let x = 0
    for(let i = 0; i < skills.length; i++){
      if(!pickMsg.components[x]) pickMsg.components[x] = { type:1, components: []}
      let skillLabel = skills[i].abilityId?.charAt(0).toUpperCase()
      if(skillLabel == 'h') skillLabel = 'R'
      if(skills[i].abilityId?.startsWith('ult')) skillLabel = 'Ult'
      skillLabel += ' - '+skills[i].nameKey
      pickMsg.components[x].components.push({
        type: 2,
        label: skillLabel,
        style: 1,
        custom_id: JSON.stringify({id: obj.id, baseId: unitSkills.baseId, skillIndex: +i})
      })
      if(pickMsg.components[x].components.length == 5) x++;
    }
    await buttonPick(obj, pickMsg)
    return
  }
  if(skills?.length === 1) skill = skills[0]
  if(skill){
    let aInfo = await getAbilityDamage(skill)
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
      title: unitSkills.nameKey+'\n'+msgTitle,
    }
    embedMsg.description = await cleanDesc(skill.descKey)
    if(aInfo && aInfo.length > 0){
      embedMsg.description += '\n**Ability Multiper**\n'
      for(let i in aInfo) embedMsg.description += aInfo[i].type+' x '+numeral(aInfo[i].multipler).format('0.000')+'\n'
    }
    msg2send.content = null
    msg2send.embeds = [embedMsg]
  }
  return msg2send
}
