'use strict'
const mongo = require('mongoclient')
const numeral = require('numeral')
const { findUnit, replyError } = require('src/helpers')
const enumSlots = { 2: 'Square', 3: 'Arrow', 4: 'Diamond', 5: 'Triangle', 6: 'Circle', 7: 'Cross' }
const enumStats = require('src/helpers/enum/stats')
const getSetType = (sets=[])=>{
  let str = ''
  for(let i in sets){
    if(i > 0) str += ' - '
    str += `${sets[i].nameKey} (${sets[i].setCount})`
  }
  return str
}
const getModField = (mod = {})=>{
  if(!enumSlots[mod.slot]) return
  let res = { name: `Best ${enumSlots[mod.slot]} Mod`, value: '' }
  for(let i=0;i<5;i++){
    if(!mod.stats[i]) break
    if(mod.stats[i] < 5) continue
    res.value += `${enumStats[mod.stats[i].statId]} - ${numeral(mod.stats[i].pct).format('0.00')}%\n`
  }
  return res
}
module.exports = async(obj = {})=>{
  try{
    let opt = obj.data?.options || {}

    let unit = opt.unit?.value?.toString()?.trim()
    if(!unit) return { content: 'you did not provide a unit to search' }

    let uInfo = await findUnit(obj, unit)
    if(uInfo === 'GETTING_CONFIRMATION') return
    if(uInfo?.msg2send) return uInfo.msg2send
    if(!uInfo?.baseId) return { content: `Error finding **${unit}**` }
    if(uInfo.combatType === 2) return { content: `Ships don't have mods...` }

    let mods = (await mongo.find('modRecommendation', { _id: uInfo.baseId }))[0]
    if(!mods?.sets) return { content: `error find mods for ${uInfo.nameKey}` }

    let iconURL = `https://game-assets.swgoh.gg/textures/${uInfo.thumbnailName}.png`
    let embedMsg = { color: 15844367, author: { icon_url: iconURL }, thumbnail:{ url: iconURL } }
    embedMsg.title = `${uInfo.nameKey} best mods based on ${mods.totalCount} units`
    embedMsg.fields = []
    let setsField = { name: 'ModSets', value: '' }
    for(let i=0;i<5;i++){
      if(!mods.sets[i]) break
      if(mods.sets[i].pct < 5) continue
      let str = getSetType(mods.sets[i].sets)
      if(!str) continue
      setsField.value += `${str} - ${numeral(mods.sets[i].pct).format('0.00')}%\n`
    }
    embedMsg.fields.push(setsField)
    for(let i in mods.stats){
      if(mods.stats[i].slot === 2 || mods.stats[i].slot === 4) continue
      let modField = getModField(mods.stats[i])
      if(modField?.name && modField?.value) embedMsg.fields.push(modField)
    }
    embedMsg.fields.push({ name: 'Note:', value: 'Data is from top 1000 players in Kyber and limited to 5 for each category' })
    return { content: null, components: [], embeds: [embedMsg] }
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
