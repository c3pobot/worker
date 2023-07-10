'use strict'
const damageTypes = {
  'ATTACK_DAMAGE': 'Physical Damage',
  'ABILITY_POWER': 'Special Damage',
  'MAX_HEALTH': 'Max Health'
}
module.exports = async(skill)=>{
  try{
    if(skill.abilityId.startsWith('lead')) return;
    if(skill){
      let effectRef, res = []
      if(skill.tiers && skill.tiers[(+skill.tiers.length - 1)] && skill.tiers[(+skill.tiers.length - 1)].effectReference){
         effectRef = skill.tiers[(+skill.tiers.length - 1)].effectReference
         for(let i in effectRef){
           if(effectRef[i].id.includes('damage')){
             const effects = skill.abilityDamage.find(x=>x.id == effectRef[i].id)
             if(effects){
               const tempObj = {}
               for(let d in effects.param){
                 if(damageTypes[effects.param[d]]) tempObj.type = damageTypes[effects.param[d]]
               }
               if(effects.multiplierAmountDecimal) tempObj.multipler = +(effects.multiplierAmountDecimal)/10000
               if(tempObj.type && tempObj.multipler && res.filter(x=>x.multipler == tempObj.multipler).length == 0) res.push(tempObj)
             }
           }
         }
      }else{
        if(skill.abilityId.startsWith('ultimate')){
          for(let i in skill.abilityDamage){
            if(skill.abilityDamage[i].id.includes('damage')){
              const tempObj = {}
              for(let d in skill.abilityDamage[i].param){
                if(damageTypes[skill.abilityDamage[i].param[d]]) tempObj.type = damageTypes[skill.abilityDamage[i].param[d]]
              }
              if(skill.abilityDamage[i].multiplierAmountDecimal) tempObj.multipler = +(skill.abilityDamage[i].multiplierAmountDecimal)/10000
              if(tempObj.type && tempObj.multipler && res.filter(x=>x.multipler == tempObj.multipler).length == 0) res.push(tempObj)
            }
          }
        }
      }
      return res
    }
  }catch(e){
    console.log(e)
  }
}
