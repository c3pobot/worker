'use strict'
const CheckUnits = require('./checkUnits')
module.exports = (groups = [], roster = {})=>{
  try{
    let res = [], len = groups.length, i = 0
    while(i < len){
      let units = CheckUnits(groups[i].units, roster)
      if(units?.length > 0){
        if(units?.filter(x=>x.notMet === 0).length >= groups[i].numUnits){
          res = res.concat(units?.filter(x=>x.notMet === 0))
        }else{
          res = res.concat(units)
        }
      }
      ++i
    }
    return res
  }catch(e){
    throw(e);
  }
}
