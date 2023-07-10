'use strict'
const uInfo = require('../uInfo')
const getSkillHTML = (skill = {})=>{
  try{
    let html
    for(let i in skill){
      let img
      if(!skill[i]) continue
      if(!skill[i].isZeta && !skill[i].isOmi) continue;
      if(skill[i].tier < skill[i].zetaTier && skill[i].tier < skill[i].omiTier) continue;
      if(skill[i].tier >= skill[i].zetaTier) img = 'zeta'
      if(skill[i].isOmi && skill[i].tier >= skill[i].omiTier) img = 'omi'
      if(img){
        if(!html) html = ''
        html += '<tr><td colspan="3" class="unit-zeta"><img src="/asset/'+img+'.png"> '+skill[i].type+' : '+skill[i].nameKey+'</td></tr>'
      }
    }
    return html
  }catch(e){
    throw(e)
  }
}
const getBasicHtml = (unit = {})=>{
  try{
    let html = ''
    html += '<tr>'
      html += '<td class="unit-level">L'+unit.level+'</td>'
      html += '<td class="unit-rarity">'
        for(let i=0;i<7;i++) html += '<img src="/asset/'+(i < unit.rarity ? 'star-yellow':'star-grey')+'.png">';
      html += '</td>'
      if(unit.combatType === 1){
        let gearColor = uInfo.gearColors[unit.gearTier], gearValue = 'G'+unit.gearTier
        if(unit.relicTier) gearValue = 'R'+unit.relicTier
        html += '<td class="unit-gear"><div style="color: '+gearColor+'">'+gearValue+'</div></td>'
      }else{
        html += '<td>&nbsp;</td>'
      }
    html += '</tr>'
    return html
  }catch(e){
    throw(e)
  }
}
module.exports = (data = {})=>{
  try{
    let html = '', unit = data.unit, tableClass = 'unit-portrait'
    if(data.unit2) tableClass = 'unit-portrait-compare'
    html += '<table class="'+tableClass+'" background="/portrait/'+unit.icon+'.png">'
      //extras row
      html += '<tr>'
        html += '<td valign="bottom">'
        html +='<table class="unit-extra">'
          //skill row
          if(unit.combatType === 1){
            if(unit.ultimate){
              for(let i in unit.ultimate) html += '<tr><td colspan="3" class="unit-zeta"><img src="/asset/ultimate.png"> ULT : '+unit.ultimate[i].nameKey+'</td></tr>'
            }
            let skillHtml = getSkillHTML(unit.skill)
            if(skillHtml) html += skillHtml
          }
          //basics row
          if(!data.unit2) html += getBasicHtml(unit)
        html += '</table>'
        html += '</td>'
      html += '</tr>'
    html += '</table>'
    return html
  }catch(e){
    throw(e)
  }
}
