'use strict'
const sorter = require('json-array-sorter')
const { getUnit } = require('src/helpers')
const { formatWebUnit } = require('src/format')

module.exports = async(fInfo = {}, roster = [], Format = formatWebUnit, maxUnits = 40)=>{
  let res = []
  let fUnits = fInfo.units || []
  if(fUnits?.length === 0 || roster?.length === 0) return res
  for(let i in fUnits){
    let tempUnit = Format(roster.find(x=> x.definitionId.startsWith(fUnits[i].baseId + ':')) , fUnits[i])
    if(!tempUnit?.baseId) continue
    if(fUnits[i].crew?.length > 0){
      tempUnit.crew = []
      for(let c in fUnits[i].crew){
        let cInfo = await getUnit(fUnits[i].crew[c], true, false)
        if(cInfo){
          let tempCrew = await Format(roster.find(x=>x.definitionId.startsWith(fUnits[i].crew[c] + ':')), cInfo)
          if(tempCrew) tempUnit.crew.push(tempCrew)
        }
      }
    }
    res.push(tempUnit)
  }
  if(res?.length > 0) res = sorter([{ column: 'sort', order: 'descending' }], res);
  if(maxUnits >= 0) res = res.slice(0, maxUnits)
  return res
}
