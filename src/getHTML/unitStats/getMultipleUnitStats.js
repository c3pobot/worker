'use strict'
const numeral = require('numeral')
const uInfo = require('../uInfo')
const isOdd = (num)=>{
  return num % 2
}
const getStats = require('./getStats')
const getRelicStats = require('./getRelicStats')
const getAbilityDamage = require('./getAbilityDamage')
module.exports = (data = {})=>{
  try{
    let counts = { oddCount: 0, abilityDamageHeader: false }, unit1 = data.unit, unit2 = data.unit2, stats1 = unit1.stats, stats2 = unit2.stats
    let html = '<table width="100%" padding="0" border="0">'
    if(data.player2) html += '<tr class="stat-title-compare"><td>&nbsp;</td><td>'+data.player+'</td><td>'+data.player2+'</td></tr>'
    if(!data.player2) html += '<tr class="stat-title-compare"><td>&nbsp;</td><td>Current</td><td>Modified</td></tr>'
    html += '<tr class="stat-odd">'
      html += '<td class="unit-stat">Rarity</td>'
      html += '<td class="unit-stat">'
        for(let i=0;i<7;i++) html += '<img src="/asset/'+(i < unit1.rarity ? 'star-yellow':'star-grey')+'.png">';
      html += '</td>'
      html += '<td class="unit-stat">'
        for(let i=0;i<7;i++) html += '<img src="/asset/'+(i < unit2.rarity ? 'star-yellow':'star-grey')+'.png">';
      html += '</td>'
    html += '</tr>'
    if(unit1.combatType === 1){
      let gearColor1 = uInfo.gearColors[unit1.gearTier], gearValue1 = 'G'+unit1.gearTier
      let gearColor2 = uInfo.gearColors[unit2.gearTier], gearValue2 = 'G'+unit2.gearTier
      if(unit1.relicTier) gearValue1 = 'R'+unit1.relicTier
      if(unit2.relicTier) gearValue2 = 'R'+unit2.relicTier
      html += '<tr class="stat-even">'
        html += '<td class="unit-stat">Gear/Relic</td>'
        html += '<td class="unit-stat"><div style="color: '+gearColor1+'">'+gearValue1+'</div></td>'
        html += '<td class="unit-stat"><div style="color: '+gearColor2+'">'+gearValue2+'</div></td>'
      html += '</tr>'
    }
    html += '<tr class="stat-odd">'
      html += '<td class="unit-stat">GP</td>'
      html += '<td class="unit-stat">'+unit1.gp.toLocaleString()+'</td>'
      html += '<td class="unit-stat">'+unit2.gp.toLocaleString()+'</td>'
    html += '</tr>'
    html += '<tr class="stat-even">'
      html += '<td class="unit-stat">Health<br>Protection<br>Speed<br>Critical Damage</td>'
      html += '<td class="unit-stat" id="unit1-stat-1">'+(getStats(unit1, [1, 28, 5, 16]))+'</td>'
      html += '<td class="unit-stat" id="unit2-stat-1">'+(getStats(unit2, [1, 28, 5, 16]))+'</td>'
    html += '</tr>'
    html += '<tr class="stat-odd">'
      html += '<td class="unit-stat">Potency<br>Tenacity<br>Health Steal</td>'
      html += '<td class="unit-stat" id="unit1-stat-2">'+(getStats(unit1, [17, 18, 27]))+'</td>'
      html += '<td class="unit-stat" id="unit2-stat-2">'+(getStats(unit2, [17, 18, 27]))+'</td>'
    html += '</tr>'
    html += '<tr class="stat-even">'
      html += '<td class="unit-stat">Physical Damage<br>Critical Chance<br>Armor Pen<br>Armor</td>'
      html += '<td class="unit-stat" id="unit1-stat-3">'+(getStats(unit1, [6, 14, 10, 8]))+'</td>'
      html += '<td class="unit-stat" id="unit2-stat-3">'+(getStats(unit2, [6, 14, 10, 8]))+'</td>'
    html += '</tr>'
    html += '<tr class="stat-odd">'
      html += '<td class="unit-stat">Special Damage<br>Critical Chance<br>Resistance Pen<br>Resistance</td>'
      html += '<td class="unit-stat" id="unit1-stat-4">'+(getStats(unit1, [7, 15, 11, 9]))+'</td>'
      html += '<td class="unit-stat" id="unit2-stat-4">'+(getStats(unit2, [7, 15, 11, 9]))+'</td>'
    html += '</tr>'
    html += getRelicStats(counts, stats1, stats2)
    html += getAbilityDamage(unit1.skill, unit1, unit2, counts)
    if(unit1.ultimate) html += getAbilityDamage(unit1.ultimate, unit1, unit2, counts)
    html += '</table>'
    return html
  }catch(e){
    console.error(e);
  }
}
