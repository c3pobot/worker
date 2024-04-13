'use strict'
module.exports = (obj, rarity)=>{
  if(obj){
    let i = rarity
    let rtnObj = {}
    for(i;i<8;i++){
      rtnObj[i] = obj.filter(x=>x.currentRarity == i).length
    }
    return rtnObj
  }
}
