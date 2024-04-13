'use strict'
module.exports = (obj = [], id)=>{
  return obj.reduce((acc, a)=>{
    return acc+ a.purchasedAbilityId.filter(x=>x == id).length
  },0)
}
