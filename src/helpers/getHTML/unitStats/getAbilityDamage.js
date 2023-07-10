'use strict'
const isOdd = (num)=>{
  return num % 2
}
module.exports = (skill = {}, unit1 = {}, unit2, counts = {})=>{
  try{
    let html = '', tdleft = 'stat-left', tdright = 'stat-right', titleClass = 'stat-title'
    if(unit2) tdleft = 'unit-stat', tdright = 'unit-stat', titleClass = 'stat-title-compare'
    for(let i in skill){
      let bkImg = 'stat-even'
      if(!skill[i] || !skill[i]?.damage) continue;
      let skillTier = skill[i].tier || 1
      let skillTier2 = 0
      if(unit2 && unit2.skill[skill[i].id]) skillTier2 = unit2.skill[skill[i].id].tier || 1
      console.log(counts.oddCount)
      console.log(isOdd(counts.oddCount))
      if(isOdd(counts.oddCount)) bkImg = 'stat-odd'
      if(!counts.abilityDamageHeader){
        html += '<tr class="'+titleClass+'"><td colspan="3">Ability Damage</td></tr>'
        counts.abilityDamageHeader = true
      }
      html += '<tr class="'+bkImg+'">'
        html += '<td class="'+tdleft+'">'+skill[i].nameKey+' ('+skill[i].type+') : </td>'
        let maxDamage = 0, maxDamage2 = 0
        for(let d in skill[i].damage[skillTier].damage){
          let damage = Math.floor(unit1.stats[skill[i].damage[skillTier].damage[d].statId].final * (skill[i].damage[skillTier].damage[d].multiplierAmountDecimal / 10000))
          if(damage > maxDamage) maxDamage = damage
          if(unit2 && skillTier2){
            let damage2 = Math.floor(unit2.stats[skill[i].damage[skillTier2].damage[d].statId].final * (skill[i].damage[skillTier2].damage[d].multiplierAmountDecimal / 10000))
            if(damage2 > maxDamage2) maxDamage2 = damage2
          }
        }
        html += '<td class="'+tdright+'">'+maxDamage.toLocaleString()+'</td>'
        if(unit2) html += '<td class="unit-stat">'+maxDamage2.toLocaleString()+'</td>'
      html += '</tr>'
      ++counts.oddCount
    }
    return html
  }catch(e){
    throw(e)
  }
}
