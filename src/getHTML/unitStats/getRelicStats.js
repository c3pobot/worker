'use strict'
const numeral = require('numeral')
const relicStats = {
  '37':{
    id: 37,
    baseId: 52,
    base: 0,
    nameKey: 'Accuracy'
  },
  '39':{
    id: 39,
    baseId: 35,
    base: 0,
    nameKey: 'Crit Avoidance'
  },
  '12':{
    id: 12,
    baseId: 12,
    base: 2,
    nameKey: 'Evasion'
  }
}
const isOdd = (num)=>{
  return num % 2
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
module.exports = ( counts = {}, stats1 = {}, stats2)=>{
  let html = ''
  for(let i in relicStats){
    let bkImg = 'stat-even', relicStat2, tdleft = 'stat-left', tdright = 'stat-right'
    if(stats2) tdleft = 'unit-stat', tdright = 'unit-stat'
    if(isOdd(counts.oddCount)) bkImg = 'stat-odd'
    let relicStat1 = getRelicStat(stats1, relicStats[i])
    if(stats2) relicStat2 = getRelicStat(stats2, relicStats[i])
    if(relicStat1 || relicStat2){
      ++counts.oddCount
      html += '<tr class="'+bkImg+'">'
        html += '<td class="'+tdleft+'">'+(relicStat1?.nameKey || relicStat2?.nameKey)+' : </td>'
        html += '<td class="'+tdright+'">'+(relicStat1?.value || 0)+'%</td>'
        if(stats2) html += '<td class="unit-stat">'+(relicStat2?.value || 0)+'%</td>'
      html += '</tr>'
    }
  }
  return html
}
