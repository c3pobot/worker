'use strict'
const { dataList } = require('src/helpers/dataList')
const getNewObj = (leader)=>{
  let uInfo = dataList?.unitList[leader?.baseId]
  if(uInfo) return { baseId: leader.baseId, nameKey: uInfo.name, total: 0, battles: 0}
}
module.exports = ( defense = {}, warSquad = [] )=>{
  for(let i in warSquad){
    let leader = warSquad[i]?.squad?.cell?.find(x=>x.squadUnitType === 2 || x.squadUnitType === 3)
    if(leader) leader.baseId = leader.unitDefId.split(':')[0]
    if(leader.baseId){
      if(!defense[leader.baseId]) defense[leader.baseId] = getNewObj(leader)
      if(defense[leader.baseId]){
        defense[leader.baseId].total++
        defense[leader.baseId].battles += warSquad[i]?.successfulDefends || 0
      }
    }
  }
}
