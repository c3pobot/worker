'use strict'
const numeral = require('numeral')
module.exports = (obj = {}, stat)=>{
  let finalStat = 0, pctOveride = 0
  if(obj.base) finalStat = (obj.base[stat] || 0);
  if(obj.mods) finalStat += (obj.gear[stat] || 0) + (obj.mods[stat] || 0)
  if(obj.crew) finalStat += (obj.crew[stat] || 0)
  if(stat == 14 || stat == 15){
    pctOveride++
    if(obj.mods){
      if(stat == 14) finalStat += (obj.mods[21] || 0);
      if(stat == 15) finalStat += (obj.mods[22] || 0)
    }
  }
  if(statEnum.pct[stat] || pctOveride > 0) return numeral(finalStat * 100).format('0.0')
  return numeral(finalStat).format('0,0')
}
