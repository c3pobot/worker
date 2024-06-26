'use strict'
const log = require('logger')
const mongo = require('mongoclient')
let mapInProgress = {}
const mapPlatoons = async(tbData = {})=>{
  let platoons = {}
  let tbDef = (await mongo.find('tbDefinition', {_id: tbData.definitionId}, {nameKey: 1, reconZoneDefinition: 1}))[0]
  let locale = (await mongo.find('localeFiles', {_id: 'ENG_US'}))[0]
  if(tbDef?.reconZoneDefinition && tbData.reconZoneStatus){
    for(let i in tbData.reconZoneStatus){
      let pDef = tbDef.reconZoneDefinition.find(x=>x?.zoneDefinition?.zoneId === tbData.reconZoneStatus[i].zoneStatus?.zoneId)
      let phase = await GetPhase(tbData.reconZoneStatus[i].zoneStatus?.zoneId)
      let conflict = await GetConflict(tbData.reconZoneStatus[i].zoneStatus?.zoneId)
      let id = phase+'-' +conflict
      if(!platoons[id]) platoons[id] = { id: id, phase: phase, conflict: conflict, squads: [], totalPoints: 0 }
      if(!platoons[id].nameKey) platoons[id].nameKey = locale[pDef?.zoneDefinition?.nameKey] || pDef?.zoneDefinition?.nameKey
      for(let p in tbData.reconZoneStatus[i].platoon){
        let squad = await GetSquads(tbData.reconZoneStatus[i].platoon[p]?.squad, pDef?.platoonDefinition.find(x=>x?.id === tbData.reconZoneStatus[i].platoon[p]?.id, platoons[id]))
        if(squad){
          platoons[id].totalPoints += squad.points || 0
          platoons[id].squads.push(squad)
        }
      }
    }
  }
  await mongo.set('tbPlatoons', {_id: tbData.definitionId}, {id: tbData.definitionId, nameKey: tbDef.nameKey, platoons: Object.values(platoons)})
}
module.exports = async(tbData = {})=>{
  try{
    if(mapInProgress[tbData.definitionId]) return

    mapInProgress[tbData.definitionId] = 1
    if(tbData.reconZoneStatus.filter(x=>x.platoon.length > 0).length !== tbData.reconZoneStatus.length) return

    let pDef = (await mongo.find('tbPlatoons', {_id: tbData.definitionId}))[0]
    if(!pDef) await MapPlatoons(tbData)
    delete mapInProgress[tbData.definitionId]
  }catch(e){
    log.error(e);
  }
}
