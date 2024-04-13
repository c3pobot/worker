'use strict'
module.exports = (str, num)=>{
  try{
    if(str.length > num) str = str.slice(0, num) + '...'
    return str
  }catch(e){
    throw(e)
  }
}
