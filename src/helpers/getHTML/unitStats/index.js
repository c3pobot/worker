'use strict'
const getUnitStats = require('./getUnitStats')
const getUnitMods = require('./getUnitMods')
const uInfo = require('./uInfo')
const getSkillHTML = (skill = {})=>{
  try{
    let html
    for(let i in skill){
      let img
      if(!skill[i]) continue
      if(!skill[i].isZeta && !skill[i].isOmi) continue;
      if(skill[i].tier < skill[i].zetaTier && skill[i].tier < skill[i].omiTier) continue;
      if(skill[i].tier >= skill[i].zetaTier) img = 'zeta'
      if(skill[i].tier >= skill[i].omiTier) img = 'omi'
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
const getDate = (timestamp)=>{
  let dateOptions = {month: 'numeric', day: 'numeric', year: 'numeric'}
  let dateTime = new Date(+timestamp)
  return dateTime.toLocaleDateString('en-US', dateOptions)+' '+dateTime.toLocaleTimeString('en-US')
}
module.exports = (data = {})=>{
  try{
    //header
    let unit = data.unit, colSpan = 1
    if(unit.combatType === 1 && unit.mods) colSpan = 2
    //let html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><link href="https://fonts.googleapis.com/css?family=Antic" rel="stylesheet"><link rel="stylesheet" type="text/css" href="static/css/unit.css"></head>'
    let html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">'
    html += '<link href="https://fonts.googleapis.com/css?family=Antic" rel="stylesheet">'
    html += '<link href="/css/unitStat.css" rel="stylesheet">'
    html += '</head>'
    html += '<body>'
    html += '<table class="unit-image">'
    html += '<tr>'
    html += '<td valign="top">'
    //unit start
      html += '<table class="unit-image-inner">'
      html += '<tr><td colspan="2"><table class="unit-portrait" background="/portrait/'+unit.icon+'.png">'
      html += '<tr><td class="unit-name">'+unit.nameKey+'</td></tr>'
      html += '<tr><td colspan="3">&nbsp;</td></tr>'
        //unitextra start
        html += '<tr><td valign="bottom"><table class="unit-extra" id="unit-extra">'

        if(unit.combatType === 1){
          if(unit.ultimate){
            for(let i in unit.ultimate) html += '<tr><td colspan="3" class="unit-zeta"><img src="/asset/ultimate.png"> ULT : '+unit.ultimate[i].nameKey+'</td></tr>'
          }

          let skillHtml = getSkillHTML(unit.skill)
          if(skillHtml) html += skillHtml
        }
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
        html += '</table></td></tr>'
        //unitextra end

      html += '</table></td></tr>'

      html += getUnitStats(unit)
      html += '</table>'
    //unit end
    html += '</td>'
    //mods start
    if(unit.combatType === 1 && unit.mods){
      html += getUnitMods(unit.mods)
    }
    html += '</tr>'
    if(data.player && data.updated) html += '<tr><td colspan="'+colSpan+'" class="footer-text">'+data.player+'\'s '+unit.nameKey+' | '+(getDate(data.updated))+'</td></tr>'
    html += '</table>'
    html += '</body>'
    html += '</html>'

    return html
  }catch(e){
    console.error(e)
  }
}
