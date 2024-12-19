'use strict'
const sorter = require('json-array-sorter')
const numeral = require('numeral')
const { getPlayerAC, getGuildId, findUnit, fetchGuild, truncateString, getRelicLevel } = require('src/helpers')

const modStatObj = {
  'speed': { statId: 5, name: "Speed", ln: 9 },
  "potency": { statId: 17, name: "Potency", pct: true, ln: 15 },
  "tenacity": { statId: 18, name: "Tenacity", pct: true, ln: 15 },
  'offense': { statId: 6, name: 'Offense', ln: 13, pri: { id: 6, name: 'P' }, sec: { id: 7, name: 'S' } },
  'p': { statId: 6, name: 'Physical Damage', ln: 13 },
  's': { statId: 7, name: 'Special Damage', ln: 13 },
  'health': { statId: 1, name: "Health", ln: 16 },
  "protection": { statId: 28, name: "Protection", ln: 16 },
  'defense': { statId: 0, name: 'Defense', ln: 12, pri: { id: 8, name: 'A' }, sec: { id: 9, name: 'R' } },
  'a': { statId: 8, name: 'Armor', ln: 12 },
  'r': { statId: 9, name: 'Resistance', ln: 12 }
}
const formatStat = (stat = {}, combatType = 1)=>{
  let res = ''
  if(stat.pct){
    res = numeral(stat.final || 0).format('0.00')
    if(combatType === 2){
      if(stat.crew){
        res += `(${numeral(stat.crew || 0).format('0.00')})`
      }else{
        res += `(0)`
      }
    }else{
      if(stat.mods){
        res += `(${numeral(stat.mods || 0).format('0.00')})`
      }else{
        res += `(0)`
      }
    }

  }else{
    res = numeral(stat.final || 0).format('0,0')
    if(combatType === 2){
      if(stat.crew){
        res += `(${numeral(stat.crew || 0).format('0,0')})`
      }else{
        res += '(0)'
      }
    }else{
      if(stat.mods){
        res += `(${numeral(stat.mods || 0).format('0,0')})`
      }else{
        res += '(0)'
      }
    }
  }
  return res
}
module.exports = async(obj = {}, opt = {})=>{
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
  let allyCode = allyObj?.allyCode
  if(!allyCode) return { content: 'You do not have allyCode linked to discord' }

  let unit = opt.unit?.value?.toString()?.trim()
  if(!unit) return { content: 'You did not provide a unit'}

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(uInfo?.msg2send) return uInfo.msg2send
  if(!uInfo?.baseId) return { content: `Error finding unit **${unit}**` }

  let pObj = await getGuildId({}, { allyCode: allyCode })
  if(!pObj?.guildId) return { content: 'error finding guildId...' }

  let gObj = await fetchGuild({ guildId: pObj.guildId, projection: { playerId: 1, name: 1, roster: { [uInfo.baseId]: 1 } } })
  if(!gObj?.member || gObj?.member?.length == 0) return { content: `error finding guild...` }

  let { gLevel, rLevel } = getRelicLevel(opt, 2, 0), units = []
  let statId = opt.stat?.value
  if(!modStatObj[statId]?.name) return { content: '**'+statId+'** is not a valid stat to look up' }

  if(uInfo.combatType == 1){
    units = gObj.member.filter(r=>r.roster && r.roster[uInfo.baseId] && r.roster[uInfo.baseId].gearTier >= gLevel && r.roster[uInfo.baseId].relicTier >= rLevel)?.map(m=>{
      return {
        member: m.name,
        rarity: m.roster[uInfo.baseId].rarity,
        gp: m.roster[uInfo.baseId].gp,
        gear: m.roster[uInfo.baseId].gearTier,
        relic: m.roster[uInfo.baseId].relicTier || 0,
        speed: m.roster[uInfo.baseId].stats[5]?.final || 0,
        potency: m.roster[uInfo.baseId].stats[17]?.final || 0,
        tenacity: m.roster[uInfo.baseId].stats[18]?.final || 0,
        health: m.roster[uInfo.baseId].stats[1]?.final || 0,
        protection: m.roster[uInfo.baseId].stats[28]?.final || 0,
        a: m.roster[uInfo.baseId].stats[8]?.final || 0,
        r: m.roster[uInfo.baseId].stats[9]?.final || 0,
        p: m.roster[uInfo.baseId].stats[6]?.final || 0,
        s: m.roster[uInfo.baseId].stats[7]?.final || 0,
        stats: m.roster[uInfo.baseId].stats || {}
      }
    })
  }
  if(uInfo.combatType == 2){
    units = gObj.member.filter(r=>r.roster && r.roster[uInfo.baseId])?.map(m=>{
      return {
        member: m.name,
        rarity: m.roster[uInfo.baseId].rarity,
        gp: m.roster[uInfo.baseId].gp,
        speed: m.roster[uInfo.baseId].stats[5],
        potency: m.roster[uInfo.baseId].stats[17],
        tenacity: m.roster[uInfo.baseId].stats[18],
        health: m.roster[uInfo.baseId].stats[1],
        protection: m.roster[uInfo.baseId].stats[28],
        a: m.roster[uInfo.baseId].stats[8],
        r: m.roster[uInfo.baseId].stats[9],
        p: m.roster[uInfo.baseId].stats[6],
        s: m.roster[uInfo.baseId].stats[7],
        stats: m.roster[uInfo.baseId].stats || {}
      }
    })
  }
  if(!units) return { content: 'error getting guild units...' }
  if(units?.length == 0) return { content: `no one in the guild has **${uInfo.nameKey}** at the requested gear/relic level...` }

  if(opt.rarity?.value) units = units.filter(x=>x.rarity >= opt.rarity?.value)
  if(units?.length === 0) return { content: `no one in the guild has **${uInfo.nameKey}** at the requested rarity level...` }

  if(statId === 'offense' || statId === 'defense'){
    if(statId === 'offense'){
      units = sorter([{column: 'p', order: 'descending'}], units)
    }else{
      units = sorter([{column: 'a', order: 'descending'}], units)
    }
  }else{
    units = sorter([{column: statId, order: 'descending'}], units)
  }
  if(statId === 'offense' || statId === 'defense'){
    let tempUnit = units[0]
    if(statId === 'offense'){
      if(tempUnit?.p > tempUnit?.s){
        statId = 'p'
      }else{
        statId = 's'
      }
    }else{
      if(tempUnit?.a > tempUnit?.r){
        statId = 'a'
      }else{
        statId = 'r'
      }
    }
  }
  let statInfo = JSON.parse(JSON.stringify(modStatObj[statId]))
  let unitsObj = {}
  for(let i in units){
    if(!unitsObj[units[i].rarity]){
      unitsObj[units[i].rarity] = {
        rarity: units[i].rarity,
        players: []
      }
    }
    if(unitsObj[units[i].rarity] && unitsObj[units[i].rarity].players) unitsObj[units[i].rarity].players.push(units[i])
  }
  let array = Object.values(unitsObj)
  if(array?.length > 0) array = sorter([{column: 'rarity', order: 'descending'}], array)
  if(!array || array.length == 0) return { content: 'error sorting guild units...' }

  let msg2send = { content: null, embeds: [] }, iconURL = `https://game-assets.swgoh.gg/textures/${uInfo.thumbnailName}.png`
  let embedMsg = {
    color: 15844367,
    title: gObj.name+' ('+gObj.member.length+')',
    timestamp: new Date(gObj.updated),
    description: `${uInfo.nameKey} (<UNITCOUNT>/${units.length}) - ${statInfo.name}`,
    author: {
      icon_url: iconURL
    },
    thumbnail:{
      url: iconURL
    },
    footer:{
      text: 'Data Updated'
    }
  }
  if(uInfo.combatType == 1){
    if(rLevel) embedMsg.description += ` - Relic >= ${rLevel}`
    if(!rLevel && gLevel) embedMsg.description += ` - Gear >= ${gLevel}`
  }
  if(opt.rarity?.value) embedMsg.description += ` - Rarity >= ${opt.rarity.value}`
  embedMsg.fields = []
  for(let i in array){
    let count = 0, unitCount = 0
    let tempObj = {
      name: array[i].rarity+"★ : ",
      value: "```autohotkey\n"
    }
    for(let p in array[i].players){
      tempObj.value += `${formatStat(array[i].players[p].stats[statInfo.statId]).padStart(statInfo.ln, ' ')} : `
      if(uInfo.combatType == 1) tempObj.value += (array[i].players[p].relic > 0 ? 'R'+array[i].players[p].relic.toString().padStart(2, '0')+' : ':'G'+array[i].players[p].gear.toString().padStart(2, '0')+' : ')
      tempObj.value += (await truncateString(array[i].players[p].member, 13))+"\n"
      count++
      unitCount++
      if((+p + 1) == array[i].players.length && count < 25) count = 25
      if(count == 25){
        tempObj.value += '```'
        tempObj.name += '('+unitCount+')'
        embedMsg.fields.push(tempObj)
        embedMsg.description = embedMsg.description.replace('<UNITCOUNT>', unitCount)
        if(msg2send.embeds.length < 11) msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
        embedMsg.fields = []
        embedMsg.description = `${uInfo.nameKey} (<UNITCOUNT>/${units.length}) - ${statInfo.name}`
        if(uInfo.combatType == 1){
          if(rLevel) embedMsg.description += ` - Relic >= ${rLevel}`
          if(!rLevel && gLevel) embedMsg.description += ` - Gear >= ${gLevel}`
        }
        if(opt.rarity?.value) embedMsg.description += ` - Rarity >= ${opt.rarity.value}`
        tempObj.name = array[i].rarity+"★ : "
        tempObj.value = "```autohotkey\n"
        count = 0,
        unitCount = 0
      }
    }
  }
  return msg2send
}
