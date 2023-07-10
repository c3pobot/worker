'use strict'
module.exports = (opt = [], optName, defaultValue)=>{
  try{
    let res = defaultValue
    const obj = opt.find(x=>x.name === optName)
    if(obj) res = obj.value
    if(res && typeof res === 'string') res = res.trim()
    return res
  }catch(e){
    throw(e)
  }
}
