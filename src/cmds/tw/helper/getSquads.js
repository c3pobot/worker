'use strict'
const { dataList } = require('src/helpers/dataList')
module.exports = (conflictStatus = {})=>{
  let squads = conflictStatus?.warSquad?.map(x=>{
    return Object.assign({}, {
      playerId: x.playerId,
      playerName: x.playerName,
      squadId: x.squadId,
      battleCount: x.successfulDefends,
      squadStatus: x.squadStatus,
      combatType: (x?.crewInfo?.length > 0 ? 2:1),
      leader: x.squad?.cell?.filter(y=>y.squadUnitType === 3 || y.squadUnitType === 2)[0]?.unitDefId?.split(':')[0]
    })
  })

  for(let i in squads){
    if(dataList?.unitList[squads[i].leader]) squads[i].leader = dataList?.unitList[squads[i].leader].name
  }

  return squads
}
