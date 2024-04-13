'use strict'
const removePct = (str)=>{
  str = str.replace("%", "")
  return str
}
const getModValue = require('./getModValue')
const sorter = require('json-array-sorter')
const enum = require('helpers/enum')
module.exports = async(mods)=>{
  let res = []
  for(let i=0;i<mods.length;i++){
    let modDef = gameData.modDefData[mods[i].definitionId]
    if(modDef){
      let tempObj = {
        slot: (+modDef.slot) - 1,
        shapeId: "shape-"+(modDef.rarity > 4 ? modDef.rarity : 5)+"-"+((+modDef.slot) - 1)+"-"+mods[i].tier,
        iconId: "icon-"+modDef.setId+"-"+mods[i].tier,
        posId: (+modDef.setId == 4 ? "pos-"+((+modDef.slot) - 1)+"-align-speed":"pos-"+((+modDef.slot) - 1)+"-align"),
        pStatText: getModValue(mods[i].primaryStat.stat.unitStatId, +mods[i].primaryStat.stat.unscaledDecimalValue)+" "+removePct(enum.stats[mods[i]?.primaryStat?.stat?.unitStatId]),
        tier: mods[i].tier,
        level: mods[i].level,
        set: modDef.setId,
        pips: modDef.rarity
      }
      if(mods[i]?.secondaryStat?.length > 0){
        tempObj.sStatText = ''
        for(let s in mods[i].secondaryStat){
          tempObj.sStatText += '('+mods[i].secondaryStat[s].statRolls+") "+getModValue(mods[i].secondaryStat[s].stat.unitStatId, +mods[i].secondaryStat[s].stat.unscaledDecimalValue)+" "+removePct(enum.stats[mods[i].secondaryStat[s].stat.unitStatId])
          if(s < mods[i].secondaryStat.length) tempObj.sStatText += "<br>"
        }
      }
      res.push(tempObj)
    }
  }
  if(res.length > 0){
    res = sorter([{
      column: 'slot',
      order: 'ascending'
    }], res)
  }
  return res
}
