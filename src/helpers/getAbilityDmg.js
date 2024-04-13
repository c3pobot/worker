'use strict'
const mongo = require('mongoclient')
const numeral = require('numeral')
const sorter = require('json-array-sorter')
const getAbilityType = require('./getAbilityType')
const { damageType } = require('./enum')
module.exports = async(unit = {}, uInfo = {})=>{
  let res = []
  let skills = sorter([{column: 'id', order: 'ascending'}], unit.skill.filter(x=>(x.id.startsWith('basic') || x.id.startsWith('special')) && x.tier >=0))
  let skillInfo = (await mongo.find('skills', {_id: uInfo.baseId}))[0]
  for(let s in skills){
    let tier = skills[s].tier
    let skill = skillInfo?.skills?.find(x=>x.skillId == skills[s].id)
    let effectReference = skill?.tiers[tier].effectReference.filter(x=>x.id.includes('damage'))
    for(let e in effectReference){
      let effects = skill.abilityDamage.find(x=>x.id === effectReference[e].id), damageId, dmg
      if(effects?.param){
        for(let p in effects.param){
          if(damageType[effects.param[p]]) damageId = damageType[effects.param[p]];
        }
      }
      if(damageId) dmg = Math.floor((unit.stats?.final[damageId] || 0) * (+(effects.multiplierAmountDecimal) / 10000))
      if(dmg){
        let index = res.findIndex(x=>x.id === skill.skillId)
        if(index >= 0){
          res[index].damage.push(numeral(dmg).format('0,0'))
        }else{
          res.push({
            id: skill.skillId,
            type: getAbilityType(skill?.skillId),
            nameKey: (uInfo?.skills ? uInfo.skills[skill.skillId]?.nameKey:''),
            damage: [
              numeral(dmg).format('0,0')
            ]
          })
        }
      }
    }
  }
  return res
}
