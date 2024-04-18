'use strict'
module.exports = (obj = [], rarity)=>{
  let i = rarity, rtnObj = {}
  for(i;i<8;i++){
    rtnObj[i] = obj.filter(x=>x.currentRarity == i).length
  }
  return rtnObj
}
