'use strict'
const numeral = require('numeral')
const getShapeId = (mod)=>{
  let rarity = '5'
  if(mod.rarity > 4) rarity = mod.rarity.toString()
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
    let html = '<td id="unitMods" valign="top" class="modsPanel">'
    html += '<table width="358">'
    html += '<tbody id="unit-mods">'
    /*
    html += '<tr>'
    html += '<td class="stat-title">Mods</td>'
    html += '</tr>'
    */
    for(let i in mods){
      html += '<tr><td class="mod-image">'
      html += '<div class="mod-shape '+(getShapeId(mods[i]))+'"><div class="mod-icon icon-'+mods[i].setId+'-'+mods[i].tier+' '+(getPosId(mods[i]))+'"></div></div>'
      html += '<div class="modsPrimary"><b>'+(getStat(mods[i]))+'</b></div>'
      if(mods[i].secondaryStat?.length > 0){
        html += '<div class="modsSecondary">'
        html += '('+mods[i].secondaryStat[0].rolls+') '+(getStat(mods[i].secondaryStat[0]))
        let s = 1, len = mods[i].secondaryStat.length
        while(s < len){
          html += '<br>('+mods[i].secondaryStat[s].rolls+') '+(getStat(mods[i].secondaryStat[s]))
          ++s
        }
        html += '</div></td></tr>'
      }
    }
    html += '</tbody>'
    html += '</table>'
    html += '</td>'
    return html
  }catch(e){
    console.error(e)
  }
}
