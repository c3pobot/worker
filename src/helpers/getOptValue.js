'use strict'
module.exports = (opt = [], optName, defaultValue)=>{
  let res = defaultValue
  let obj = opt.find(x=>x.name === optName)
  if(obj) res = obj.value
  return res
}
