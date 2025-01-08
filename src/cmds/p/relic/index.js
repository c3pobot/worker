'use strict'
const sorter = require('json-array-sorter')

const { dataList } = require('src/helpers/dataList')
const { getPlayerAC, fetchPlayer, truncateString, getRelicLevel } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let max_relic = opt.max_relic?.value, exact_match = opt.exact_match?.value
  if(max_relic) max_relic = +max_relic + 2
  if(!dataList?.unitList) return { content: 'unitList is empty' }

  let allyObj = await getPlayerAC(obj, opt)
  let allyCode = allyObj?.allyCode
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  if(!allyCode) return { content: 'You do not have allycode linked to discordId' }

  let pObj = await fetchPlayer({ allyCode: allyCode.toString() })
  if(!pObj?.rosterUnit) return { content: 'error getting player data' }

  let gType = opt.option?.value, gValue = opt.value?.value, sort = opt.sort?.value || 'nameKey', order = 'ascending'
  if(sort == 'gp') order = 'descending'

  let { rLevel, gLevel } = getRelicLevel(opt, 7, 13)
  if(rLevel > 0) rLevel += 2
  let units = pObj?.rosterUnit?.filter(x=>x.relic?.currentTier >= rLevel && x.currentTier >= gLevel)?.map((u)=>{
    let baseId = u?.definitionId?.split(':')[0]
    return {
      baseId: baseId,
      nameKey: dataList.unitList[baseId]?.name || baseId,
      gear: u.currentTier || 0,
      relic: u.relic?.currentTier || 0,
      gp: u.gp || 0
    }
  })
  if(exact_match){
    units = units.filter(x=>x.gear === gLevel)
    if(rLevel) units = units.filter(x=>x.relic === rLevel)
  }
  if(max_relic && rLevel && !exact_match) units = units.filter(x=>x.relic < max_relic + 1)
  if(!units) return { content: 'error getting untis' }
  if(units.length == 0) return { content: 'Player has no units that meet the requested criteria' }

  units = sorter([{column: sort, order: order}], units)
  let msg2send = { content: null, embeds: [] }
  let embedMsg = {
    color: 15844367,
    timestamp: new Date(pObj.updated),
    title: pObj.name+' ('+units.length+')',
    description: 'Units '
  }
  let embedDesc = 'Units '
  if(rLevel){
    if(exact_match){
       embedDesc += `Relic = ${rLevel - 2}`
    }else{
      if(max_relic){
        embedDesc += `${max_relic - 2} >= Relic >= ${rLevel - 2}`
      }else{
        embedDesc += `Relic >= ${rLevel - 2}`
      }
    }
  }else{
    if(exact_match){
      embedDesc += `Gear = ${gLevel}`
    }else{
      embedDesc += `Gear >= ${gLevel}`
    }
  }
  embedDesc += ` (<UNITCOUNT>)\n\`\`\`\nG/R : Unit\n`
  embedMsg.description =  embedDesc
  let count = 0, unitCount = 0
  for(let i in units){
    if(units[i].baseId){
      let nameKey = units[i].nameKey
      let gearText = (rLevel ? 'R'+(units[i].relic - 2).toString().padStart(2, '0'):'G'+units[i].gear.toString().padStart(2, '0'))
      embedMsg.description += gearText+' : '+(nameKey ? truncateString(nameKey, 25):units[i].baseId)+'\n'
      count++;
      unitCount++
    }
    if(((+i + 1) == units.length) && count < 25) count = 25
    if(count == 25){
      embedMsg.description += '```'
      embedMsg.description = embedMsg.description.replace('<UNITCOUNT>', unitCount)
      if(msg2send.embeds.length < 10){
        msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
      }else{
        msg2send.content = 'There are more than 250 units that meet the criteria. I can only show 250'
      }
      embedMsg.description = embedDesc
      count = 0
      unitCount = 0
    }
  }
  return msg2send
}
