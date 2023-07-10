'use strict'
module.exports = (str, num)=>{
  try{
    if(str.length > num){
      str = str.slice(0, (num - 3))
      str += '...'
    }
    return str
  }catch(e){
    throw(e);
  }
}
