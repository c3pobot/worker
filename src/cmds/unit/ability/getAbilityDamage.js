'use strict'
const damageTypes = {
  'ATTACK_DAMAGE': 'Physical Damage',
  'ABILITY_POWER': 'Special Damage',
  'MAX_HEALTH': 'Max Health'
}
module.exports = (skill = {})=>{
  if(!skill || skill.abilityId.startsWith('lead')) return;
  let effectRef, res = [], array = skill?.abilityDamage?.filter(x=>x.id?.includes('damage')) || []
  if(!array || array?.length == 0) return
  for(let i in array){
    let tempObj = {}
    for(let d in array[i].param){
      if(damageTypes[array[i].param[d]]) tempObj.type = damageTypes[array[i].param[d]]
    }
    if(array[i].multiplierAmountDecimal) tempObj.multipler = +(array[i].multiplierAmountDecimal)/10000
    if(tempObj.type && tempObj.multipler && res.filter(x=>x.multipler == tempObj.multipler).length == 0) res.push(tempObj)
  }
  return res
}
