'use strict'
const { DeepCopy } = require('helpers')
module.exports = (units = [])=>{
  try{
    let res = {}
    for(let i in units){
      if(!res[units[i].baseId]){
        res[units[i].baseId] = DeepCopy(units[i])
        res[units[i].baseId].count = 0
      }
      res[units[i].baseId].count++
    }
    return Object.values(res)
  }catch(e){
    throw(e);
  }
}
