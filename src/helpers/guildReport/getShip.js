'use strict'
const { CalcUnitRarity } = require('./statCalc')
const numeral = require('numeral')
module.exports = (uInfo = {}, homeUnits = [], awayUnits)=>{
  let len = 7, str = ''
  const homeRarity = CalcUnitRarity(homeUnits, 5)
  if(awayUnits){
    const awayRarity = CalcUnitRarity(awayUnits, 5)
    if(homeRarity[7] > 0 || awayRarity[7] > 0){
      str += 'Seven Star   : '+numeral(homeRarity[7] || 0).format("0,0").padStart(len, ' ')+' vs '+numeral(awayRarity[7] || 0).format("0,0")+'\n'
    }
    if(homeRarity[6] > 0 || awayRarity[6] > 0){
      str += 'Six Star     : '+numeral(homeRarity[6] || 0).format("0,0").padStart(len, ' ')+' vs '+numeral(awayRarity[6] || 0).format("0,0")+'\n'
    }
    if(homeRarity[5] > 0 || awayRarity[5] > 0){
      str += 'Five Star    : '+numeral(homeRarity[5] || 0).format("0,0").padStart(len, ' ')+' vs '+numeral(awayRarity[5] || 0).format("0,0")+'\n'
    }
  }else{
    if(homeRarity[7] > 0){
      str += 'Seven Star   : '+numeral(homeRarity[7] || 0).format("0,0")+'\n'
    }
    if(homeRarity[6] > 0){
      str += 'Six   Star   : '+numeral(homeRarity[6] || 0).format("0,0")+'\n'
    }
    if(homeRarity[5] > 0){
      str += 'Five Star    : '+numeral(homeRarity[5] || 0).format("0,0")+'\n'
    }
  }
  return str
}
