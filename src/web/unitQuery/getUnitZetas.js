'use strict'
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
module.exports = (uObj, uInfo)=>{
  const obj = []
  if(uObj.purchasedAbilityId.length > 0){
    for(let u in uObj.purchasedAbilityId){
      obj.push({
        type: 'Ult',
        img: 'ultimate',
        name: uInfo.ultimate[uObj.purchasedAbilityId[u]].nameKey
      })
    }
  }
  const sortTemplate = [{
    column:"id",
    order:"ascending"
  }]
  const skills = sorter(sortTemplate, uObj.skill)
  for(let i in skills){
    const skillInfo = uInfo.skills[skills[i].id]
    if(skillInfo.omiTier && (+skills[i].tier) + 2 >= skillInfo.omiTier){
      obj.push({
        type: getAbilityType(skills[i].id),
        img: 'omni',
        name: skillInfo.nameKey
      })
    }else{
      if(skillInfo.zetaTier && (+skills[i].tier) + 2 >= skillInfo.zetaTier){
        obj.push({
          type: getAbilityType(skills[i].id),
          img: 'zeta',
          name: skillInfo.nameKey
        })
      }
    }
  }
  return obj
}
