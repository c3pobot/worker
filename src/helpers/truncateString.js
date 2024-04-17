'use strict'
module.exports = (str, num)=>{
  if(str.length > num) str = str.slice(0, num) + '...'
  return str
}
