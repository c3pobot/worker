'use strict'
const modStat = require('./modStat')
module.exports = (baseId)=>{
  if(modStat[baseId]){
    return modStat[baseId].mod
  }else{
    return (baseId)
  }
}
