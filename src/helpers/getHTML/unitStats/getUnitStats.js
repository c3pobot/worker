'use strict'
const numeral = require('numeral')
const uInfo = require('./uInfo')
const isOdd = (num)=>{
  return num % 2
}
const getStat = (stat = {}, unit = {})=>{
  try{
    let format = '0,0'
    if(stat.pct){
      format = '0.0'
      if(stat.id === 14 || stat.id === 15) format = '0.00'
    }
    let str = numeral(stat.final || 0).format(format)
    if(unit.combatType === 1  && stat.mods) str += ' ('+numeral(stat.mods || 0).format(format)+')'
    if(unit.combatType === 2 && stat.crew) str += ' ('+numeral(stat.crew || 0).format(format)+')'
    if(stat.pct) str += '%'
    return str
  }catch(e){
    throw(e)
  }
}
const getStats = (unit = {}, array = []) =>{
  try{
    let str = getStat(unit.stats[array[0]], unit), i = 1, len = array.length
    while( i < len){
      str += '<br>'+getStat(unit.stats[array[i]], unit)
      ++i
    }
    return str
  }catch(e){
    throw(e);
  }
}
const getRelicStat = (stats = {}, relicStat = {})=>{
  try{
    if(!stats[relicStat.id]) return
    if(relicStat.base >= stats[relicStat.id]?.final) return
    return { nameKey: relicStat.nameKey, value: numeral(stats[relicStat.id].final).format('0.0') }
  }catch(e){
    throw(e);
  }
}
module.exports = (unit={})=>{
  try{
    let extraRowCount = 0, oddCount = 0, stats
    if(unit.stats) stats = unit.stats
    if(!stats) stats = {}
    let html = "<tr class='stat-title'><td class='stat-left'>GP :</td><td class='stat-right'>"+unit.gp?.toLocaleString()+"</td></tr>"
    html += "<tr class='stat-even'><td class='stat-left'>Health :<br>Protection :<br>Speed :<br>Critical Damage :</td><td class='stat-right' >"+(getStats(unit, [1, 28, 5, 16]))+"</td></tr>"
    html += "<tr class='stat-odd'><td class='stat-left'>Potency :<br>Tenacity :<br>Health Steal :</td><td class='stat-right'>"+(getStats(unit, [17, 18, 27]))+"</td></tr>"
    html += "<tr class='stat-even'><td class='stat-left'>Physical Damage :<br>Critical Chance :<br>Armor Pen :<br>Armor :</td><td class='stat-right'>"+(getStats(unit, [6, 14, 10, 8]))+"</td></tr>"
    html += "<tr class='stat-odd'><td class='stat-left'>Special Damage :<br>Critical Chance :<br>Resistance Pen :<br>Resistance :</td><td class='stat-right'>"+(getStats(unit, [7, 15, 11, 9]))+"</td></tr>"
    for(let i in uInfo.relicStats){
      let bkImg = 'stat-even'
      if(isOdd(oddCount)) bkImg = 'stat-odd'
      let relicStat = getRelicStat(stats, uInfo.relicStats[i])
      if(relicStat){
        ++extraRowCount
        ++oddCount
        html += '<tr class="'+bkImg+'"><td class="stat-left">'+relicStat.nameKey+' : </td><td class="stat-right">'+relicStat.value+'%</td></tr>'
      }
    }
    let abilityDamageHeader = false
    for(let i in unit.skill){
      let bkImg = 'stat-even'
      if(isOdd(oddCount)) bkImg = 'stat-odd'
      if(!unit.skill[i] || !unit.skill[i]?.damage || !unit.skill[i].damage[unit.skill[i].tier]) continue;
      ++oddCount
      ++extraRowCount
      if(!abilityDamageHeader){
        html += '<tr class="stat-title"><td colspan="2">Ability Damage</td></tr>'
        abilityDamageHeader = true
      }
      html += '<tr class="'+bkImg+'"><td class="stat-left">'+unit.skill[i].nameKey+' ('+unit.skill[i].type+') : </td><td class="stat-right">'
      for(let d in unit.skill[i].damage[unit.skill[i].tier].damage){
        html += (unit.stats[unit.skill[i].damage[unit.skill[i].tier].damage[d].statId].final * (unit.skill[i].damage[unit.skill[i].tier].damage[d].multiplierAmountDecimal / 10000)).toLocaleString()+'<br>'
      }
      html += '</td></tr>'
    }
    if(unit.ultimate){
      for(let i in unit.ultimate){
        let bkImg = 'stat-even'
        if(isOdd(oddCount)) bkImg = 'stat-odd'
        if(!unit.ultimate[i] || !unit.ultimate[i]?.damage) continue;
        ++oddCount
        ++extraRowCount
        if(!abilityDamageHeader){
          html += '<tr class="stat-title"><td colspan="2">Ability Damage</td></tr>'
          abilityDamageHeader = true
        }
        html += '<tr class="'+bkImg+'"><td class="stat-left">'+unit.ultimate[i].nameKey+' ('+unit.ultimate[i].type+') : </td><td class="stat-right">'
        for(let d in unit.ultimate[i].damage[1].damage){
          html += (unit.stats[unit.ultimate[i].damage[1].damage[d].statId].final * (unit.ultimate[i].damage[1].damage[d].multiplierAmountDecimal / 10000)).toLocaleString()+'<br>'
        }
        html += '</td></tr>'
      }
    }
    if(unit.combatType == 1 && unit.mods){
      if(extraRowCount < 2){
        let bkImg = 'stat-even'
        if(isOdd(oddCount)) bkImg = 'stat-odd'
        oddCount++;
        html += '<tbody>'
        html += '<tr class="'+bkImg+'"><td colspan="2"></td></tr>'
        if(extraRowCount < 1){
          let bkImg = 'stat-even'
          if(isOdd(oddCount)) bkImg = 'stat-odd'
          oddCount++;
          html += '<tr class="'+bkImg+'"><td colspan="2"></td></tr>'
        }
        html += '</tbody>'
      }
    }
    return html
  }catch(e){
    console.error(e);
  }
}
