'use strict'
const removePct = (str)=>{
  str = str.replace("%", "")
  return str
}
module.exports = (mods)=>{
  const modUnsorted = []
  for(let i=0;i<mods.length;i++){
    const modDef = gameData.modDefData[mods[i].definitionId]
    if(modDef){
      const tempObj = {
        slot: (+modDef.slot) - 1,
        tier: mods[i].tier,
        level: mods[i].level,
        set: modDef.setId,
        pips: modDef.rarity,
        pStat: {
          nameKey: removePct(statEnum.stats[mods[i].primaryStat.stat.unitStatId]),
          value: ''
        },
        sStat:[]
      }
      if(statEnum.pct[mods[i].primaryStat.stat.unitStatId]){
        tempObj.pStat.value = numeral((+mods[i].primaryStat.stat.unscaledDecimalValue)/1000000).format('0.00')+'%'
      }else{
        tempObj.pStat.value = ((+mods[i].primaryStat.stat.unscaledDecimalValue)/100000000)
      }
      for(let s in mods[i].secondaryStat){
        const secObj = {
          nameKey: removePct(statEnum.stats[mods[i].secondaryStat[s].stat.unitStatId]),
          value: '',
          roll: mods[i].secondaryStat[s].statRolls
        }
        if(statEnum.pct[mods[i].secondaryStat[s].stat.unitStatId]){
          secObj.value = numeral((+mods[i].secondaryStat[s].stat.unscaledDecimalValue)/1000000).format('0.00')+'%'
        }else{
          secObj.value = ((+mods[i].secondaryStat[s].stat.unscaledDecimalValue)/100000000)
        }
        tempObj.sStat.push(secObj)
      }
      modUnsorted.push(tempObj)
    }
  }
  if(modUnsorted.length > 0){
    const sortTemplate = [{
      column: 'slot',
      order: 'ascending'
    }]
    const modSorted = sorter(sortTemplate, modUnsorted)
    return modSorted
  }else{
    return ([])
  }
}
