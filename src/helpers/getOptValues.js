'use strict'
module.exports = (opt = [] )=>{
  try{
    let res = {}
    let i = opt.length
    while(i--){
      res[opt[i].name] = opt[i].value
    }
    return res
  }catch(e){
    throw(e)
  }
}
