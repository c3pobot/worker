'use strict'
module.exports = (obj = {}, uInfo = {}) =>{
  let numZeta = +Object.values(uInfo.skills).filter(x=>x.zetaTier).length, count = 0
  for(let i in uInfo.skills){
    if(uInfo.skills[i].zetaTier){
      if(obj.skill && obj.skill.find(x=>x.id == i && +(x.tier + 2) >= +uInfo.skills[i].zetaTier)) count++;
    }
  }
  if(count == numZeta) return 'All'
  if(count == 0) return 'None'
  return 'Some'
}
