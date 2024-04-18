'use strict'
const sorter = require('json-array-sorter')
module.exports = (units, squadUnits, squad)=>{
  let tempUnits = []
  for(let i in squad.units){
    if(squad.units[i].turn){
      let unit = squadUnits.find(x=>x.definitionId.startsWith(squad.units[i].baseId+':'))
      if(unit){
        let tempObj = {
          baseId: squad.units[i].baseId,
          min: +squad.units[i].turn,
          speed: +(unit?.stats?.base[5] || 0)
        }
        if(unit?.stats?.gear) tempObj.speed += +(unit.stats.gear[5] || 0)
        if(unit?.stats?.mods) tempObj.speed += +(unit.stats.mods[5] || 0)
        if(unit?.stats?.crew) tempObj.speed += +(unit.stats.crew[5] || 0)
        tempUnits.push(tempObj)
      }
    }
  }
  if(tempUnits?.length > 0){
    tempUnits = sorter([{column: 'speed', order: 'descending'}], tempUnits)
    for(let i in units){
      let unitIndex = tempUnits.findIndex(x=>x.baseId === units[i].baseId)
      if(unitIndex >= 0){
        let tempStat = {
          nameKey: 'Turn Order',
          id: 'turn_order',
          min: tempUnits[unitIndex]?.min,
          stat: +(unitIndex + 1)
        }
        tempStat.notMet = (tempStat.min == tempStat.stat ? 0:1)
        if(!units[i].stats) units[i].stats = []
        units[i].stats.unshift(tempStat)
        if(tempStat.notMet > 0) units[i].statsNotMet++;
      }
    }
  }
}
