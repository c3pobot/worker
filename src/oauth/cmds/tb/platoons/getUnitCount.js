'use strict'
module.exports = (units = [])=>{
  let res = {}
  for(let i in units){
    if(!res[units[i].baseId]){
      res[units[i].baseId] = JSON.parse(JSON.stringify(units[i]))
      res[units[i].baseId].count = 0
    }
    res[units[i].baseId].count++
  }
  return Object.values(res)
}
