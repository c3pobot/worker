'use strict'
const sorter = require('json-array-sorter')
module.exports = (inventory = [], neededGear = [])=>{
  for(let i in neededGear){
    let item = inventory.find(x=>x.id === neededGear[i].id)
    if(item?.quantity){
      if(item?.quantity >= neededGear[i].count){
        neededGear[i].count = 0
      }else{
        if(item) neededGear[i].count -= item?.quantity
      }
    }
  }
  return sorter([{ column: 'count', order: 'descending' }], neededGear.filter(x=>x.count > 0))
}
