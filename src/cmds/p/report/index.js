'use strict'
const numeral = require('numeral')
const swgohClient = require('src/swgohClient')

const { getPlayerAC } = require('src/helpers')
const { embedField } = require('src/format')

module.exports = async(obj = {}, opt = {})=>{
  let allyObj = await getPlayerAC(obj, opt)
  let allyCode = allyObj?.allyCode
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId'}
  if(!allyCode) return { content: 'You do not have allycode linked to discordId' }

  let pObj = await swgohClient.post('fetchPlayer', {allyCode: allyCode.toString()})
  if(!pObj.allyCode) return { content: '**'+allyCode+'** is an invalid allyCode' }

  let msg2send = { content: null, embeds: [] }
  let baseMsg = {
    color: 15844367,
    timestamp: new Date(pObj.updated),
    description: '[' + pObj.name + '](https://swgoh.gg/p/' + pObj.allyCode + '/) profile (' + pObj.allyCode + ')',
    fields: [],
    footer: {
      text: "Data updated"
    }
  }
  baseMsg.fields.push(embedField('Overview', {
    'GP': numeral(pObj.gp).format('0,00'),
    'Guild': pObj.guildName,
    'level': pObj.level
  }, 13, '::'))
  baseMsg.fields.push(embedField('Mods', {
    'R6 Mods': pObj.sixModCount,
    'Mods +10': pObj.rosterUnit.reduce((acu, u) => {
      return acu + u.equippedStatMod.reduce((acm, m) => {
        return acm + m.secondaryStat.filter(ss => ss.stat.unitStatId == 5 && ss.stat.statValueDecimal > 90000 && +ss.stat.statValueDecimal < 150000).length
      }, 0)
    }, 0),
    'Mods +15': pObj.rosterUnit.reduce((acu, u) => {
      return acu + u.equippedStatMod.reduce((acm, m) => {
        return acm + m.secondaryStat.filter(ss => ss.stat.unitStatId == 5 && ss.stat.statValueDecimal > 140000 && ss.stat.statValueDecimal < 200000).length
      }, 0)
    }, 0),
    'Mods +20': pObj.rosterUnit.reduce((acu, u) => {
      return acu + u.equippedStatMod.reduce((acm, m) => {
        return acm + m.secondaryStat.filter(ss => ss.stat.unitStatId == 5 && ss.stat.statValueDecimal > 190000 && ss.stat.statValueDecimal < 250000).length
      }, 0)
    }, 0),
    'Mods +25': pObj.rosterUnit.reduce((acu, u) => {
      return acu + u.equippedStatMod.reduce((acm, m) => {
        return acm + m.secondaryStat.filter(ss => ss.stat.unitStatId == 5 && ss.stat.statValueDecimal > 240000).length
      }, 0)
    }, 0)
  }, 13 ,'::'))
  let relicObj = {
    name: 'Relics (' + pObj.rosterUnit.filter(r => r.relic && r.relic.currentTier > 2 && r.combatType == 1 && r.currentRarity >= 7).length + ')',
    value: '```autohotkey\n',
    inline: false
  }
  for (let i = 13; i > 6; i--) {
    let tempRelic = pObj.rosterUnit.filter(r => r.relic && r.relic.currentTier == +i && r.combatType == 1 && r.currentRarity >= 7).length
    if (+tempRelic > 0) relicObj.value += 'R' + (+i - 2) + '           :: ' + tempRelic + '\n';
  }
  relicObj.value += '```'
  baseMsg.fields.push(relicObj)
  baseMsg.fields.push(await embedField('Quality', {
    'Mod Quality': numeral(pObj.quality.mods).format('0.00'),
    'Gear Quality': numeral(pObj.quality.gear).format('0.00'),
    'Total': numeral(pObj.quality.mods + pObj.quality.gear).format('0.00'),
    'Top 80 Mod Q': numeral(pObj.quality.top).format('0.00')
  }, 13, '::'))
  msg2send.embeds.push(baseMsg)
  return msg2send
}
