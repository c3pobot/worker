'use strict'
const { dataList } = require('./dataList')
module.exports = (baseId)=>{
  if(!dataList?.unitList) return
  let nameKey = baseId
  let obj = dataList?.unitList[baseId]
  if(obj?.name) nameKey = obj.name;
  return nameKey;
}
