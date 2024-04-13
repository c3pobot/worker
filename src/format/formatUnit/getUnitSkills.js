'use strict'
const sorter = require('json-array-sorter')
const getAbilityType = require('helpers/getAbilityType')
module.exports = async(unit = {}, uInfo = {})=>{
  try{
    let res = []
    if(unit?.purchasedAbilityId?.length > 0){
      for(let i in unit?.purchasedAbilityId){
        res.push({
          type: 'Ult',
          img: 'ultimate',
          nameKey: uInfo.ultimate[unit.purchasedAbilityId[i]].nameKey
        })
      }
    }
    if(unit?.skill?.length > 0){
      for(let i in unit?.skill){
        let skill = uInfo.skills[unit.skill[i].id]
        if(skill.omiTier && (+unit.skill[i].tier) + 2 >= skill.omiTier){
          res.push({
            type: getAbilityType(unit.skill[i].id),
            img: 'omi',
            nameKey: skill.nameKey
          })
        }else{
          if(skill.zetaTier && (+unit.skill[i].tier) + 2 >= skill.zetaTier){
            res.push({
              type: getAbilityType(unit.skill[i].id),
              img: 'zeta',
              nameKey: skill.nameKey
            })
          }
        }
      }
    }
    if(res?.length > 0) res = sorter([{order: 'ascending', column: 'type'}], res)
    return res
  }catch(e){
    throw(e)
  }
}
