'use strict'
const { getGuildId, fetchGuild, getPlayerAC } = require('src/helpers')
const sorter = require('json-array-sorter')

module.exports = async(obj = {}, opt = {})=>{
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
  let allyCode = allyObj?.allyCode
  if(!allyCode) return { content: 'You do not have allyCode linked to discord' }

  let pObj = await getGuildId({}, { allyCode: allyCode }, {})
  if(!pObj.guildId) return { content: `Error getting guildId...` }

  let gObj = await fetchGuild({ guildId: pObj.guildId, projection: { playerId: 1, name: 1, rosterUnit: {alignment: 1, definitionId: 1, relic: 1, currentTier: 1 } } })
  if(!gObj?.members || gObj?.members?.length == 0) return { content: 'error getting guild...' }

  let gLevel = 13, rLevel = 0, order ='ascending'
  let gOption = opt.option?.value, gValue = opt.value?.value, sort = opt.sort?.value || 'name'
  if(sort == 'count') order = 'descending'
  if(gOption === 'g' && gValue >= 0) gLevel = gValue
  if(gOption === 'r' && gValue >= 0) rLevel = gValue + 2
  let members = gObj.member.filter(r=>r.rosterUnit.some(u=>u.relic && u.currentTier >= gLevel && u.relic.currentTier >= rLevel)).map(m=>{
    return Object.assign({}, {
      name: m.name,
      count: +m.rosterUnit.filter(x=>x.relic && x.currentTier >= gLevel && x.relic.currentTier >= rLevel).length || 0,
      lsCount: +m.rosterUnit.filter(x=>x.alignment === 'alignment_light' && x.relic && x.currentTier >= gLevel && x.relic.currentTier >= rLevel).length || 0,
      dsCount: +m.rosterUnit.filter(x=>x.alignment === 'alignment_dark' && x.relic && x.currentTier >= gLevel && x.relic.currentTier >= rLevel).length || 0,
      roster: m.rosterUnit.filter(x=>x.relic && x.currentTier >= gLevel && x.relic.currentTier >= rLevel).map(r=>{
        return Object.assign({}, {
          definitionId: r.definitionId,
          relic: r.relic.currentTier || 0,
          gear: r.currentTier || 0
        })
      })
    })
  })
  if(members?.length > 0) members = sorter([{column: sort, order: order}], members)
  if(!members || members?.length == 0) return { content: `No one in tht guild has units ${rLevel ? `at **R${rLevel - 2}** or higher`:``}${gLevel ? `at **G${gLevel}** or higher`:``}` }

  let embedMsg = {
    color: 15844367,
    timestamp: new Date(gObj.updated),
    title: gObj.name+' ('+gObj.member.length+')',
    description: 'Members with units '+(rLevel ? ' Relic >='+(rLevel - 2):'')+(!rLevel && gLevel ? 'Gear >='+gLevel:'')+' (<MEMBERCOUNT>)\n```\n:  LS  :  DS  : Total : Member\n'
  }
  let count = 0, memberCount = 0
  for(let i in members){
    embedMsg.description += ': '+members[i].lsCount.toString().padStart(3, '0')+'  : '+members[i].dsCount.toString().padStart(3, '0')+'  : '+members[i].count.toString().padStart(3, '0')+'   : '+members[i].name+'\n'
    count++
    memberCount++
    if(((+i + 1) == members.length) && count < 25) count = 25
    if(count == 25){
      embedMsg.description += '```'
      embedMsg.description = embedMsg.description.replace('<MEMBERCOUNT>', memberCount)
      if(msg2send.embeds.length < 10) msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
      embedMsg.description = 'Members with units '+(rLevel ? ' Relic >='+(rLevel - 2):'')+(!rLevel && gLevel ? 'Gear >='+gLevel:'')+' (<MEMBERCOUNT>)\n```\nCount : Member\n:  LS  :  DS  : Total : Member\n'
      count = 0
      memberCount = 0
    }
  }
  return { content: null, embeds: [embedMsg] }
}
