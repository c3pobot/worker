'use strict'
const numeral = require('numeral')
module.exports = (statId, base, mod)=>{
  let returnStat = ''
  if(statEnum.pct[statId]){
    returnStat = numeral(base*100).format('0.00')
    if(mod) returnStat += '('+numeral(mod*100).format('0.00')+')'
  }else{
    returnStat = numeral(base).format('0,0')
    if(mod) returnStat += '('+numeral(mod).format('0,0')+')'
  }
  return returnStat
}
