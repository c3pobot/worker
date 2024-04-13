'use strict'
const damageType = {
  'ATTACK_DAMAGE': 6,
  'ABILITY_POWER': 7,
  'MAX_HEALTH': 1
}
const getAbilityType = (id)=>{
  if(id.startsWith("basic")){
    return ("B")
  }else if(id.startsWith("special")){
    return ("S")
  }else if(id.startsWith("lead")){
    return ("L")
  }else if(id.startsWith("unique")){
    return ("U")
  }else{
    return ("None &nbsp;&nbsp;: ")
  }
}
module.exports = async(uObj, uInfo)=>{
  const abilityDmg = []
  const skills = await sorter([{column: 'id', order: 'ascending'}], uObj.skill)
  const stats = uObj.stats
  for(let i in skills){
    if(skills[i].tier > 0){
      const skillTier = skills[i].tier
      const skill = await redis.get('ad-'+skills[i].id)
      if(skill && !skill.skillId.startsWith('leader')){
        for(let s in skill.tiers[skillTier].effectReference){
          if(skill.tiers[skillTier].effectReference[s].id.includes('damage')){
            const effects = skill.abilityDamage.find(x=>x.id === skill.tiers[skillTier].effectReference[s].id)
            if(effects){
              let damageId
              for(let d in effects.param){
                if(damageType[effects.param[d]]){
                  damageId = damageType[effects.param[d]]
                }
              }
              if(damageId){
                let dStat = stats.base[damageId] || 0
                if(uInfo.combatType == 1){
                  dStat += (stats.gear[damageId] || 0) + (stats.mods[damageId] || 0)
                }else{
                  dStat += (stats.crew[damageId] || 0)
                }
                const aDmg = Math.floor(dStat * ((+effects.multiplierAmountDecimal)/10000))
                const indexExist = abilityDmg.findIndex(x=>x.id == skill.skillId)
                if(indexExist >= 0){
                  abilityDmg[indexExist].damage.push(numeral(aDmg).format('0,0'))
                }else{
                  abilityDmg.push({
                    id: skill.skillId,
                    type: getAbilityType(skill.skillId),
                    nameKey: uInfo.skills[skill.skillId].nameKey,
                    damageType: damageId,
                    damage: [
                      numeral(aDmg).format('0,0')
                    ]
                  })
                }
              }
            }
          }
        }
      }
    }
  }
  let sortTemplate = [{
    column: "type",
    order: "ascending"
  }]
  const abilityDmgSorted = sorter(sortTemplate,abilityDmg)
  return abilityDmgSorted
}
