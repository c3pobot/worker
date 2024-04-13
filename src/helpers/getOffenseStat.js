'use strict'
module.exports = async(skillInfo, statInfo)=>{
  let pd = 0, sd = 0, skills = skillInfo.skills, basicSkill
  if(skills) basicSkill = skills.find(x=>x.abilityId.startsWith('basic'))
  if(basicSkill?.abilityDamage?.length > 0){
    for(let i in basicSkill.abilityDamage){
      if(basicSkill.abilityDamage[i].id.includes('damage')){
        if(basicSkill.abilityDamage[i].param.filter(x=>x == 'ATTACK_DAMAGE').length > 0) pd++
        if(basicSkill.abilityDamage[i].param.filter(x=>x == 'ABILITY_POWER').length > 0) sd++
      }
    }
    if(pd > 0 || sd > 0){
      if(pd > sd){
        return(statInfo.pri)
      }else{
        return(statInfo.sec)
      }
    }
  }
}
