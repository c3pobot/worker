'use strict'
module.exports = (opt = [], optName, defaultValue)=>{
  try{
    let res = defaultValue
    const obj = opt.find(x=>x.name === optName)
    if(obj) res = obj.value
    return res
  }catch(e){
    console.error(e)
  }
}
