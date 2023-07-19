'use strict'
const numeral = require('numeral')
const getUnitMods = require('./getUnitMods')
const uInfo = require('../uInfo')
const isOdd = (num)=>{
  return num % 2
}
const getStats = require('./getStats')
const getRelicStats = require('./getRelicStats')
const getAbilityDamage = require('./getAbilityDamage')
module.exports = (unit={})=>{
  try{
    let counts = { oddCount: 0, abilityDamageHeader: false }, stats
    if(unit.stats) stats = unit.stats
    if(!stats) stats = {}
    let html = '<table class="stats-table" padding="0" border="0">'
    html += "<tr class='stat-title'>"
      html += "<td class='stat-left'>GP :</td>"
      html += "<td class='stat-right'>"+unit.gp?.toLocaleString()+"</td>"
    html += "</tr>"
    html += "<tr class='stat-even'>"
      html += "<td class='stat-left'>Health :<br>Protection :<br>Speed :<br>Critical Damage :</td>"
      html += "<td class='stat-right' >"+(getStats(unit, [1, 28, 5, 16]))+"</td>"
    html += "</tr>"
    html += "<tr class='stat-odd'>"
      html += "<td class='stat-left'>Potency :<br>Tenacity :<br>Health Steal :</td>"
      html += "<td class='stat-right'>"+(getStats(unit, [17, 18, 27]))+"</td>"
    html += "</tr>"
    html += "<tr class='stat-even'>"
      html += "<td class='stat-left'>Physical Damage :<br>Critical Chance :<br>Armor Pen :<br>Armor :</td>"
      html += "<td class='stat-right'>"+(getStats(unit, [6, 14, 10, 8]))+"</td>"
    html += "</tr>"
    html += "<tr class='stat-odd'>"
      html += "<td class='stat-left'>Special Damage :<br>Critical Chance :<br>Resistance Pen :<br>Resistance :</td>"
      html += "<td class='stat-right'>"+(getStats(unit, [7, 15, 11, 9]))+"</td>"
    html += "</tr>"
    html += getRelicStats(counts, stats)
    html += getAbilityDamage(unit.skill, unit, null, counts)

    if(unit.ultimate) html += getAbilityDamage(unit.ultimate, unit, null, counts)
    html += '</table>'
    return html
  }catch(e){
    console.error(e);
  }
}
