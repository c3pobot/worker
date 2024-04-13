'use strict'
const { reqStats, gearColors, relicStats } = require('helpers/enum')
const numeral = require('numeral')
module.exports = (stats, combatType)=>{
  try{
    let obj = {}
    for(let x in reqStats){
      let i = reqStats[x]
      let finalStat = (stats?.final[i] || 0)
      let modsStat = 0
      if(combatType == 1){
        if(i == 14 || i ==15){
          if(i == 14){
            modsStat += (stats?.mods[21] || 0)
          }else{
            modsStat += (stats?.mods[22] || 0)
          }
        }else{
          modsStat += (stats?.mods[i] || 0)
        }
      }
      if(combatType == 2){
        modsStat += (stats?.crew[i] || 0)
      }
      if(i == 14 || i == 15){
        obj[i] = numeral((finalStat)*100).format('0.00')+(modsStat > 0 ? ' ('+numeral(modsStat*100).format('0.00')+')' : '')+'%'
      }else{
        if(HP.enum.pct[i]){
          obj[i] = numeral((finalStat)*100).format('0.0')+(modsStat > 0 ? ' ('+numeral(modsStat*100).format('0.0')+')' : '')+'%'
        }else{
          obj[i] = numeral(finalStat).format('0,0')+(modsStat > 0 ? ' ('+numeral(modsStat).format('0,0')+')' : '')
        }
      }
    }
    return obj
  }catch(e){
    throw(e);
  }
}
