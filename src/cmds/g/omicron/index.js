'use strict'
const sorter = require('json-array-sorter')

const enumSkill = {
  b: 'Basic',
  l: 'Leader',
  s: 'Special',
  h: 'Reinforcement',
  u: 'Unique'
}
const getHTML = require('webimg').omicron
const { getGuildId, getImg, fetchGuild, getPlayerAC, findUnit, replyComponent } = require('src/helpers')
module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  let allyCode = allyObj?.allyCode
  if(!allyCode) return { content: 'You do not have allyCode linked to discord' }

  let skillId = obj.confirm?.skillId, unit = opt.unit.value?.toString()?.trim()
  if(!unit) return { content: 'you did not provide a unit...'}

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(uInfo?.msg2send) return uInfo.msg2send
  if(!uInfo?.baseId) return { content: `Error finding **${unit}**...`}

  let skills = Object.values(uInfo.skills)?.filter(x=>x.omiTier)
  if(!skills || skills?.length == 0) return { content: `**${uInfo.nameKey}** does not have any omicron abilities...`}

  if(!skillId && skills?.length === 1) skillId = skills[0].id

  if(!skillId){
    let msg2send = { content: 'Please Choose skill below for **'+uInfo.nameKey+'**', components: [] }
    for(let i in skills){
      if(!skills[i].omiTier) continue
      let skillLabel = skills[i]?.id?.charAt(0).toUpperCase()
      if(skillLabel == 'h') skillLabel = 'R'
      if(skills[i]?.id?.startsWith('ult')) skillLabel = 'Ult'
      skillLabel += ' - '+skills[i].nameKey
      if(msg2send.components?.length == 0) msg2send.components.push({ type:1, components: []})
      msg2send.components[0].components.push({
        type: 2,
        label: skillLabel,
        style: 1,
        custom_id: JSON.stringify({id: obj.id, dId: obj.members?.user?.id, unit: uInfo.baseId, skillId: skills[i].id})
      })
    }
    msg2send.components[0].components.push({
      type: 2,
      label: 'Cancel',
      style: 4,
      custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, cancel: true })
    })
    await replyComponent(obj, msg2send)
    return
  }
  let skillInfo = uInfo.skills[skillId?.trim()]
  if(!skillInfo?.omiTier) return { content: `error getting omicron skill **${skillId}** for **${uInfo.nameKey}**`}

  let pObj = await getGuildId({}, {allyCode: allyCode}, [])
  if(!pObj?.guildId) return { content: 'error getting player info...'}

  let gObj = await fetchGuild({ guildId: pObj.guildId, projection: { playerId: 1, name: 1, rosterUnit: { $elemMatch: { baseId: uInfo.baseId } } } })
  if(!gObj?.member || gObj?.member?.length == 0) return { content: 'Error getting guild info...'}

  let skillLabel = skillId?.charAt(0).toUpperCase()
  if(skillLabel == 'h') skillLabel = 'R'
  if(skillId?.startsWith('ult')) skillLabel = 'Ult'
  skillInfo.label = skillLabel
  let members = gObj.member.filter(r=>r.rosterUnit?.some(u=>u.definitionId.startsWith(uInfo.baseId+':'))).map(m=>{
    return Object.assign({}, {
      member: m.name,
      rarity: m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':')).currentRarity,
      gp: m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':')).gp,
      gear: +(m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':')).currentTier || 0),
      relic: +(m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':')).relic?.currentTier - 2 || 0),
      skillTier: +(m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':'))?.skill?.find(x=>x.id === skillId)?.tier || 0)
    })
  })
  let webData = {
    have: (sorter([{column: 'gp', order: 'descending'}], members.filter(x=>x.skillTier + 2 >= skillInfo.omiTier)) || []),
    haveNot: (sorter([{column: 'gp', order: 'descending'}], members.filter(x=>x.skillTier + 2 < skillInfo.omiTier)) || []),
    guild: gObj.profile,
    uInfo: uInfo,
    skillInfo: skillInfo
  }
  let webHTML = await getHTML.guild(webData)
  if(!webHTML) return { content: 'Error getting HTML' }

  let webImg = await getImg(webHTML, obj.id, 600, false)
  if(!webImg) return { content: 'Error getting Image' }

  return { content: null, file: webImg, fileName: gObj?.profile?.name+'-omicrons.png' }
}
