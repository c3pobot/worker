'use strict'
const checkUnits = require('./checkUnits')
module.exports = (groups = [], roster = [])=>{
  let res = []
  for(let i in groups){
    let units = checkUnits(groups[i].units, roster)
    if(units?.length > 0){
      if(units?.filter(x=>x.notMet === 0).length >= groups[i].numUnits){
        res = res.concat(units?.filter(x=>x.notMet === 0))
      }else{
        res = res.concat(units)
      }
    }
  }
  return res
}
