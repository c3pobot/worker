'use strict'
const GetAbilityDamage = require('./getAbilityDamage')
const damageTypes = {
  'ATTACK_DAMAGE': 'Physical Damage',
  'ABILITY_POWER': 'Special Damage',
  'MAX_HEALTH': 'Max Health'
}
const CleanDesc = (string)=>{
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
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'You did not provide the correct information'}, unitSkills, guildId, skillIndex, skills = [], skill, sendResponse = 1
    let unit = HP.GetOptValue(opt, 'unit')
    if(unit) unit = unit.toString().trim()
    let skillType = HP.GetOptValue(opt, 'type')
    if(obj?.confirm?.skillIndex >= 0) skillIndex = obj.confirm.skillIndex
    if(unit){
      msg2send.content = 'Error getting abilityInfo for unit **'+unit+'**'
      HP.ReportDebug(obj, 'getting unitSkills')
      unitSkills = (await mongo.find('skills', {_id: unit}))[0]
    }
    if(unitSkills){
      await HP.ReplyButton(obj, 'Getting skill info for **'+unitSkills.nameKey+'** ...')
      msg2send.content = 'Error getting skills for **'+unitSkills.nameKey+'**'
      if(unitSkills.skills?.length > 0) skills = skills.concat(unitSkills.skills)
      if(unitSkills.ultimate?.length > 0) skills = skills.concat(unitSkills.ultimate)
    }
    if(skills?.length > 0){
      if(skillType) skills = skills?.filter(x=>x.skillId?.startsWith(skillType))
      if(skills.length > 0) skills = await sorter([{column: 'id', order: 'ascending'}], skills)
      if(skillIndex >= 0 && skills[skillIndex]) skills = [skills[skillIndex]]
    }
    if(skills?.length > 1){
      const pickMsg = {
        content: 'Please Choose skill below for **'+unitSkills.nameKey+'**',
        components: []
      }
      let x = 0
      for(let i = 0; i < skills.length; i++){
        HP.ReportDebug(obj, 'requesting skill pick')
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
      await HP.ButtonPick(obj, pickMsg)
      return
    }
    if(skills?.length == 1) skill = skills[0]
    if(skill){
      HP.ReportDebug(obj, 'getting abilityDamage')
      const aInfo = await GetAbilityDamage(skill)
      let msgTitle = enumSkill[skill.abilityId.charAt(0)]
      if(skill.abilityId.startsWith('ult')) msgTitle = 'Ultimate'
      msgTitle += ' - '+skill.nameKey
      if(skill.omiTier){
        msgTitle += ' (O)'
      }else{
        if(skill.zetaTier) msgTitle += ' (Z)'
      }
      const embedMsg = {
        color: 15844367,
        title: unitSkills.nameKey+'\n'+msgTitle,
      }
      embedMsg.description = await CleanDesc(skill.descKey)
      if(aInfo && aInfo.length > 0){
        embedMsg.description += '\n**Ability Multiper**\n'
        for(let i in aInfo) embedMsg.description += aInfo[i].type+' x '+numeral(aInfo[i].multipler).format('0.000')+'\n'
      }
      msg2send.content = null
      msg2send.embeds = [embedMsg]
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
