'use strict'
const numeral = require('numeral')
const getShapeId = (mod)=>{
  let rarity = '5'
  if(mod.rarity === 6) rarity = "6"
  return 'shape-'+rarity+'-'+(mod.slot - 1)+'-'+mod.tier
}
const getPosId = (mod)=>{
  let str = 'pos-'+(mod.slot - 1)+'-align'
  if(mod.setId === 4) str += '-speed'
  return str
}
const getStat = (stat)=>{
  let format = '0'
  if(stat.pct) format = '0.00'
  let str = numeral(stat.value).format(format)
  if(stat.pct) str += '%'
  str += ' '+stat.statName
  return str
}
module.exports = (mods)=>{
  try{
    let html = '<table class="modsPanel">', count = 0, modArray = [2, 3, 4, 5, 6, 7], i = 0
    html += '<tbody>'
    html += '<tr><td>&nbsp;</td></tr>'
    while(i < 6){
      if(!mods[modArray[i]]) ++i
      html += '<tr>'
        html += '<td class="mod-image">'
        html += '<div class="mod-shape '+(getShapeId(mods[modArray[i]]))+'"><div class="mod-icon icon-'+mods[modArray[i]].setId+'-'+mods[modArray[i]].tier+' '+(getPosId(mods[modArray[i]]))+'"></div></div>'
        html += '</td>'
      html += '</tr>'
      html += '<tr><td class="mod-stat mod-primaryStat">'+(getStat(mods[modArray[i]]))+'</td></tr>'
      if(mods[modArray[i]].secondaryStat?.length > 0){
        let s = 0, len = mods[modArray[i]].secondaryStat.length
        while(s < len){
          html += '<tr><td class="mod-stat mod-secondaryStat">'+(getStat(mods[modArray[i]].secondaryStat[s]))+' ('+mods[modArray[i]].secondaryStat[s].rolls+')</td></tr>'
          ++s
        }
      }
      ++i
    }
    html += '</tbody>'
    html += '</table>'
    return html
  }catch(e){
    console.error(e)
  }
}
