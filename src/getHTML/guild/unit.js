'use strict'
const isOdd = (num)=>{
  return num % 2
}
const getDate = require('../getDate')
const getUnitZeta = (zeta = [], skill = {})=>{
  try{
    let html = ''
    for(let i in zeta){
      html += '<td class="unit-skill">'
      if(skill[zeta[i].id] && skill[zeta[i].id].tier >= zeta[i].zetaTier){
        html += 'X'
      }else{
        html += '&nbsp;'
      }
      html += '</td>'
    }
    return html
  }catch(e){
    throw(e)
  }
}
const getUnitOmi = (omi = [], skill = {})=>{
  try{
    let html = ''
    for(let i in omi){
      html += '<td class="unit-skill">'
      if(skill[omi[i].id] && skill[omi[i].id].tier >= omi[i].omiTier){
        html += 'X'
      }else{
        html += '&nbsp;'
      }
      html += '</td>'
    }
    return html
  }catch(e){
    throw(e)
  }
}
const getUnitUltimate = (ultimate = [], skill = {})=>{
  try{
    let html = ''
    for(let i in ultimate){
      html += '<td class="unit-skill">'
      if(skill[ultimate[i].id]){
        html += 'X'
      }else{
        html += '&nbsp;'
      }
      html += '</td>'
    }
    return html
  }catch(e){
    throw(e)
  }
}
module.exports = ({ uInfo = {}, units = [], profile = {}, updated })=>{
  try{
    let colSpan = 4, omi = [], ultimate = [], zeta = [], tablewidth = 255, skillWidth = 110
    let skills = Object.values(uInfo.skill)
    if(skills?.length > 0){
      omi = skills.filter(x=>x.isOmi)
      zeta = skills.filter(x=>x.isZeta)
    }
    if(uInfo.ultimate) ultimate = Object.values(uInfo.ultimate)
    if(!ultimate) ultimate = []
    colSpan += omi.length
    colSpan += zeta.length
    colSpan += ultimate.length
    tablewidth += zeta.length * skillWidth
    tablewidth += omi.length * skillWidth
    tablewidth += ultimate.length * skillWidth
    let html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">'
    html += '<link href="https://fonts.googleapis.com/css?family=Antic" rel="stylesheet">'
    html += '<link href="/css/guildUnit.css" rel="stylesheet">'
    html += '<link href="/css/unitImg.css" rel="stylesheet">'
    html += '</head>'
    html += '<body>'
    html += '<table class="main-table" width="'+tablewidth+'px">'
      html += '<tr class="header-text">'
        html += '<td colSpan="'+colSpan+'">'
          html += '<table width=100%>'
            html += '<tr>'
              html += '<td class="unit-icon"><div style="margin-left: 10px" class="character-portrait__image-frame character-portrait__image-frame--size-small"><img class="character-portrait__img character-portrait__img--size-small" src="/thumbnail/'+uInfo.icon+'.png"></div></td>'
              html += '<td class="guild-text">'+profile.name+' '+uInfo.nameKey+'\'s ('+units.length+')</td>'
            html += '</tr>'
          html += '</table>'
        html += '</td>'
      html += '</tr>'
      html += '<tr class="unit-text">'
        html += '<td class="unit-name">Member</td>'
        html += '<td class="unit-rarity">Rarity</td>'
        html += '<td class="unit-gp">GP</td>'
        html += '<td class="unit-gear">Gear/Relic</td>'
        if(zeta.length > 0){
          for(let i in zeta){
            if(zeta[i]) html += '<td class="unit-skill">'+zeta[i].nameKey+'<br>'+zeta[i].type+' - Zeta</td>'
          }
        }
        if(omi.length > 0){
          for(let i in omi){
            if(omi[i]) html += '<td class="unit-skill">'+omi[i].nameKey+'<br>'+omi[i].type+' - Omi</td>'
          }
        }
        if(ultimate.length > 0){
          for(let i in ultimate){
            if(ultimate[i]) html += '<td class="unit-skill">'+ultimate[i].nameKey+'<br>Ultimate</td>'
          }
        }
      html += '</tr>'
      let i = units.length, oddCount = 0
      const getTrClass = ()=>{
        if(isOdd(oddCount)){
          return 'row-odd'
        }else{
          return 'row-even'
        }

      }
      const getGear = (unit = {})=>{
        if(unit.relicTier > 0){
          return 'R'+unit.relicTier
        }else{
          return 'G'+unit.gearTier
        }
      }
      while(i--){
        let unit = units[i].unit
        html += '<tr class="'+getTrClass()+'">'
          html += '<td class="unit-name">'+units[i].member+'</td>'
          html += '<td class="unit-rarity">'+unit.rarity+'</td>'
          html += '<td class="unit-gp">'+unit.gp.toLocaleString()+'</td>'
          html += '<td class="unit-gear">'+getGear(unit)+'</td>'
          if(zeta.length > 0) html += getUnitZeta(zeta, unit.skill)
          if(omi.length > 0) html += getUnitOmi(omi, unit.skill)
          if(ultimate.length > 0) html += getUnitUltimate(ultimate, unit.ultimate)
        html += '</tr>'
        oddCount++
      }
      if(updated) html += '<tr class="footer-text"><td colSpan="'+colSpan+'">Data Updated : '+getDate(updated)+'</td></tr>'
    html += '</table>'
    html += '</body>'
    html += '</html>'
    return html
  }catch(e){
    throw(e)
  }
}
